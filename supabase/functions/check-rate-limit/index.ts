import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Rate limit configs per action
const RATE_LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  login: { maxRequests: 10, windowMs: 900000 }, // 10 per 15 min
  signup: { maxRequests: 5, windowMs: 3600000 }, // 5 per hour
  referral_submit: { maxRequests: 10, windowMs: 3600000 }, // 10 per hour
  payment_submit: { maxRequests: 5, windowMs: 3600000 }, // 5 per hour
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, identifier } = body;

    if (!action || !identifier) {
      return new Response(JSON.stringify({ error: "Missing action or identifier" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const config = RATE_LIMITS[action];
    if (!config) {
      return new Response(JSON.stringify({ allowed: true }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const windowStart = new Date(Date.now() - config.windowMs).toISOString();
    const { count } = await adminClient
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("identifier", identifier)
      .eq("action", action)
      .gte("window_start", windowStart);

    const currentCount = count ?? 0;
    const allowed = currentCount < config.maxRequests;

    if (allowed) {
      await adminClient.from("rate_limits").insert({
        identifier,
        action,
        window_start: new Date().toISOString(),
      });
    }

    return new Response(
      JSON.stringify({ allowed, remaining: Math.max(0, config.maxRequests - currentCount - (allowed ? 1 : 0)) }),
      { status: allowed ? 200 : 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
