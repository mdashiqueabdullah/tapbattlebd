import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MIN_INTERVAL_MS = 40;
const MAX_REASONABLE_SCORE_PER_TAP = 60;
const MAX_SESSION_DURATION_MS = 15 * 60 * 1000;
const MIN_VARIANCE_THRESHOLD = 2;
const MAX_TAPS_PER_SECOND = 18;

interface TapEvent {
  timestamp: number;
  ball_type: string;
  points: number;
  multiplier: number;
}

interface SubmitPayload {
  session_token: string;
  client_score: number;
  tap_count: number;
  tap_events: TapEvent[];
  visibility_changes: number;
  focus_losses: number;
  duration_ms: number;
}

function calculateBotRisk(
  tapEvents: TapEvent[],
  visibilityChanges: number,
  focusLosses: number,
  durationMs: number,
  clientScore: number,
  tapCount: number
): { riskScore: number; flags: string[] } {
  const flags: string[] = [];
  let riskScore = 0;
  if (tapEvents.length < 2) return { riskScore: 0, flags };

  const intervals: number[] = [];
  for (let i = 1; i < tapEvents.length; i++) {
    intervals.push(tapEvents[i].timestamp - tapEvents[i - 1].timestamp);
  }
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  const veryFastTaps = intervals.filter((i) => i < MIN_INTERVAL_MS).length;
  if (veryFastTaps > intervals.length * 0.1) { flags.push("impossibly_fast_taps"); riskScore += 40; }
  if (stdDev < MIN_VARIANCE_THRESHOLD && intervals.length > 10) { flags.push("machine_like_consistency"); riskScore += 35; }
  if (avgInterval > 0) { const cv = stdDev / avgInterval; if (cv < 0.05 && intervals.length > 20) { flags.push("low_coefficient_of_variation"); riskScore += 25; } }
  if (durationMs > 0) { const tps = (tapCount / durationMs) * 1000; if (tps > MAX_TAPS_PER_SECOND) { flags.push("excessive_tap_rate"); riskScore += 30; } }
  if (tapCount > 0 && clientScore / tapCount > MAX_REASONABLE_SCORE_PER_TAP) { flags.push("impossible_score_per_tap"); riskScore += 50; }
  if (visibilityChanges > 10) { flags.push("excessive_visibility_changes"); riskScore += 15; }
  if (durationMs > MAX_SESSION_DURATION_MS) { flags.push("session_too_long"); riskScore += 10; }

  const recalculated = tapEvents.reduce((sum, e) => sum + e.points, 0);
  if (Math.abs(clientScore - recalculated) > Math.max(clientScore * 0.15, 10)) { flags.push("score_mismatch"); riskScore += 45; }

  return { riskScore: Math.min(100, riskScore), flags };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = user.id;

    const body: SubmitPayload = await req.json();
    const { session_token, client_score, tap_count, tap_events, visibility_changes, focus_losses, duration_ms } = body;

    if (!session_token) {
      return new Response(JSON.stringify({ error: "Missing session token" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Rate limit
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: submitCount } = await adminClient.from("rate_limits").select("*", { count: "exact", head: true }).eq("identifier", userId).eq("action", "score_submit").gte("window_start", oneHourAgo);
    if ((submitCount ?? 0) >= 30) {
      return new Response(JSON.stringify({ error: "Too many submissions" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate session
    const { data: session, error: sessionError } = await adminClient.from("game_sessions").select("*").eq("session_token", session_token).eq("user_id", userId).eq("status", "active").single();
    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Anti-cheat
    const events = tap_events || [];
    const { riskScore, flags } = calculateBotRisk(events, visibility_changes || 0, focus_losses || 0, duration_ms || 0, client_score || 0, tap_count || 0);
    const intervals: number[] = [];
    for (let i = 1; i < events.length; i++) intervals.push(events[i].timestamp - events[i - 1].timestamp);
    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const variance = intervals.length > 0 ? intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length : 0;
    const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;
    const maxInterval = intervals.length > 0 ? Math.max(...intervals) : 0;
    const isFlagged = riskScore >= 40;
    const verifiedScore = isFlagged ? 0 : Math.max(0, client_score || 0);

    // Update game session
    await adminClient.from("game_sessions").update({
      status: "completed", client_score: client_score || 0, verified_score: verifiedScore,
      tap_count: tap_count || 0, avg_interval_ms: avgInterval, interval_variance: variance,
      min_interval_ms: minInterval, max_interval_ms: maxInterval, bot_risk_score: riskScore,
      visibility_changes: visibility_changes || 0, focus_losses: focus_losses || 0,
      flagged: isFlagged, flag_reasons: flags, review_status: isFlagged ? "flagged" : "approved",
      ended_at: new Date().toISOString(),
    }).eq("id", session.id);

    // Log rate limit
    await adminClient.from("rate_limits").insert({ identifier: userId, action: "score_submit", window_start: new Date().toISOString() });

    // === Create attempt record and update leaderboard for ranked games ===
    let attemptNumber = 0;
    if (!session.is_practice) {
      // Get or create current contest
      const { data: contestId } = await adminClient.rpc("get_or_create_current_contest");
      
      if (contestId) {
        // Count existing attempts
        const { data: countData } = await adminClient.rpc("get_user_attempt_count", { _user_id: userId, _contest_id: contestId });
        const currentCount = countData ?? 0;
        
        // Get user's extra/bonus attempts
        const { data: profileData } = await adminClient.from("profiles").select("extra_attempts, bonus_attempts, total_ranked_games, lifetime_best_score").eq("id", userId).single();
        const extraAttempts = (profileData?.extra_attempts ?? 0) + (profileData?.bonus_attempts ?? 0);
        const maxAttempts = 10 + extraAttempts;

        if (currentCount < maxAttempts) {
          attemptNumber = currentCount + 1;
          
          // Insert attempt
          await adminClient.from("attempts").insert({
            user_id: userId,
            contest_id: contestId,
            attempt_number: attemptNumber,
            score: verifiedScore,
            session_id: session.id,
            session_started_at: session.started_at,
            session_ended_at: new Date().toISOString(),
          });

          // Update leaderboard
          await adminClient.rpc("update_leaderboard_scores", { _user_id: userId, _contest_id: contestId });

          // Update profile stats
          const newTotalRanked = (profileData?.total_ranked_games ?? 0) + 1;
          const newLifetimeBest = Math.max(profileData?.lifetime_best_score ?? 0, verifiedScore);
          await adminClient.from("profiles").update({
            total_ranked_games: newTotalRanked,
            lifetime_best_score: newLifetimeBest,
            updated_at: new Date().toISOString(),
          }).eq("id", userId);
        }
      }
    } else {
      // Update practice game count
      const { count: practiceCount } = await adminClient.from("game_sessions").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_practice", true).eq("status", "completed");
      await adminClient.from("profiles").update({ total_practice_games: practiceCount ?? 0, updated_at: new Date().toISOString() }).eq("id", userId);
    }

    return new Response(
      JSON.stringify({ verified_score: verifiedScore, flagged: isFlagged, risk_score: riskScore, session_id: session.id, attempt_number: attemptNumber }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
