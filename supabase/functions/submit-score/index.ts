import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Anti-cheat thresholds
const MIN_INTERVAL_MS = 40; // Impossible to tap faster than 40ms consistently
const MAX_REASONABLE_SCORE_PER_TAP = 60; // Mega(10) * 4x frenzy * 1.5 frenzy bonus ≈ 60
const MAX_SESSION_DURATION_MS = 15 * 60 * 1000; // 15 min max session
const MIN_VARIANCE_THRESHOLD = 2; // Bot-like if variance < 2ms
const MAX_TAPS_PER_SECOND = 18; // Human limit ~12-15 taps/sec

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

  if (tapEvents.length < 2) {
    return { riskScore: 0, flags };
  }

  // Calculate intervals
  const intervals: number[] = [];
  for (let i = 1; i < tapEvents.length; i++) {
    intervals.push(tapEvents[i].timestamp - tapEvents[i - 1].timestamp);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const minInterval = Math.min(...intervals);
  const maxInterval = Math.max(...intervals);
  const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // 1. Impossibly fast taps
  const veryFastTaps = intervals.filter((i) => i < MIN_INTERVAL_MS).length;
  if (veryFastTaps > intervals.length * 0.1) {
    flags.push("impossibly_fast_taps");
    riskScore += 40;
  }

  // 2. Too consistent intervals (bot-like)
  if (stdDev < MIN_VARIANCE_THRESHOLD && intervals.length > 10) {
    flags.push("machine_like_consistency");
    riskScore += 35;
  }

  // 3. Coefficient of variation too low
  if (avgInterval > 0) {
    const cv = stdDev / avgInterval;
    if (cv < 0.05 && intervals.length > 20) {
      flags.push("low_coefficient_of_variation");
      riskScore += 25;
    }
  }

  // 4. Taps per second check
  if (durationMs > 0) {
    const tapsPerSecond = (tapCount / durationMs) * 1000;
    if (tapsPerSecond > MAX_TAPS_PER_SECOND) {
      flags.push("excessive_tap_rate");
      riskScore += 30;
    }
  }

  // 5. Score per tap too high
  if (tapCount > 0) {
    const scorePerTap = clientScore / tapCount;
    if (scorePerTap > MAX_REASONABLE_SCORE_PER_TAP) {
      flags.push("impossible_score_per_tap");
      riskScore += 50;
    }
  }

  // 6. Suspicious visibility/focus patterns
  if (visibilityChanges > 10) {
    flags.push("excessive_visibility_changes");
    riskScore += 15;
  }

  // 7. Session too long
  if (durationMs > MAX_SESSION_DURATION_MS) {
    flags.push("session_too_long");
    riskScore += 10;
  }

  // 8. Score manipulation check - verify tap events sum roughly matches client score
  const recalculatedScore = tapEvents.reduce((sum, e) => sum + e.points, 0);
  const scoreDiff = Math.abs(clientScore - recalculatedScore);
  if (scoreDiff > Math.max(clientScore * 0.15, 10)) {
    flags.push("score_mismatch");
    riskScore += 45;
  }

  return { riskScore: Math.min(100, riskScore), flags };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = claimsData.claims.sub;

    const body: SubmitPayload = await req.json();
    const { session_token, client_score, tap_count, tap_events, visibility_changes, focus_losses, duration_ms } = body;

    if (!session_token) {
      return new Response(JSON.stringify({ error: "Missing session token" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 30 score submissions per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count: submitCount } = await adminClient
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", userId)
      .eq("action", "score_submit")
      .gte("window_start", oneHourAgo);

    if ((submitCount ?? 0) >= 30) {
      return new Response(JSON.stringify({ error: "Too many submissions. Please wait." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Validate session token
    const { data: session, error: sessionError } = await adminClient
      .from("game_sessions")
      .select("*")
      .eq("session_token", session_token)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (sessionError || !session) {
      return new Response(JSON.stringify({ error: "Invalid or expired session" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Calculate anti-cheat metrics
    const events = tap_events || [];
    const { riskScore, flags } = calculateBotRisk(events, visibility_changes || 0, focus_losses || 0, duration_ms || 0, client_score || 0, tap_count || 0);

    // Calculate intervals for storage
    const intervals: number[] = [];
    for (let i = 1; i < events.length; i++) {
      intervals.push(events[i].timestamp - events[i - 1].timestamp);
    }
    const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0;
    const variance = intervals.length > 0 ? intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length : 0;
    const minInterval = intervals.length > 0 ? Math.min(...intervals) : 0;
    const maxInterval = intervals.length > 0 ? Math.max(...intervals) : 0;

    const isFlagged = riskScore >= 40;
    const verifiedScore = isFlagged ? 0 : Math.max(0, client_score || 0);

    // Update session
    await adminClient
      .from("game_sessions")
      .update({
        status: "completed",
        client_score: client_score || 0,
        verified_score: verifiedScore,
        tap_count: tap_count || 0,
        avg_interval_ms: avgInterval,
        interval_variance: variance,
        min_interval_ms: minInterval,
        max_interval_ms: maxInterval,
        bot_risk_score: riskScore,
        visibility_changes: visibility_changes || 0,
        focus_losses: focus_losses || 0,
        flagged: isFlagged,
        flag_reasons: flags,
        review_status: isFlagged ? "flagged" : "approved",
        ended_at: new Date().toISOString(),
      })
      .eq("id", session.id);

    // Log rate limit
    await adminClient.from("rate_limits").insert({
      identifier: userId,
      action: "score_submit",
      window_start: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        verified_score: verifiedScore,
        flagged: isFlagged,
        risk_score: riskScore,
        session_id: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
