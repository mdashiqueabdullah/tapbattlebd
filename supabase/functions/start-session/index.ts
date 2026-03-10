import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateSessionToken(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const timestamp = Date.now().toString(36);
  const random = Array.from(crypto.getRandomValues(new Uint8Array(24)))
    .map((b) => chars[b % chars.length])
    .join("");
  return `${timestamp}_${random}`;
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

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const userId = user.id;

    const body = await req.json();
    const { is_practice, screen_width, screen_height, timezone } = body;

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limit: max 20 session starts per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await adminClient
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", userId)
      .eq("action", "session_start")
      .gte("window_start", oneHourAgo);

    if ((count ?? 0) >= 20) {
      return new Response(JSON.stringify({ error: "Too many session starts. Please wait." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Check for existing active sessions and close them
    await adminClient
      .from("game_sessions")
      .update({ status: "abandoned", ended_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("status", "active");

    // Create session
    const sessionToken = generateSessionToken();
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const { data: session, error: sessionError } = await adminClient
      .from("game_sessions")
      .insert({
        user_id: userId,
        session_token: sessionToken,
        is_practice: is_practice ?? false,
        ip_address: ip,
        user_agent: userAgent,
        screen_width: screen_width ?? null,
        screen_height: screen_height ?? null,
        timezone: timezone ?? null,
      })
      .select()
      .single();

    if (sessionError) {
      return new Response(JSON.stringify({ error: "Failed to create session" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Log rate limit
    await adminClient.from("rate_limits").insert({
      identifier: userId,
      action: "session_start",
      window_start: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ session_token: sessionToken, session_id: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
