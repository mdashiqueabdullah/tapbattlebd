import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getPrizeByRank(rank: number): number | null {
  if (rank === 1) return 3000;
  if (rank === 2) return 2000;
  if (rank === 3) return 1000;
  if (rank >= 4 && rank <= 10) return 500;
  if (rank >= 11 && rank <= 50) return 150;
  if (rank >= 51 && rank <= 100) return 50;
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { payment_method, account_number, contest_id } = await req.json();

    if (!payment_method || !account_number || !contest_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // 1. Check user is an official winner for this contest
    const { data: winner } = await admin
      .from("monthly_winners")
      .select("final_rank, prize_amount")
      .eq("user_id", user.id)
      .eq("contest_id", contest_id)
      .maybeSingle();

    if (!winner) {
      return new Response(
        JSON.stringify({ error: "আপনি এই কনটেস্টের বিজয়ী তালিকায় নেই।" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (winner.final_rank > 100) {
      return new Response(
        JSON.stringify({ error: "আপনার র‍্যাঙ্ক ১০০ এর বাইরে, তাই আপনি পেআউট অনুরোধ পাঠাতে পারবেন না।" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prizeAmount = getPrizeByRank(winner.final_rank);
    if (!prizeAmount) {
      return new Response(
        JSON.stringify({ error: "Invalid rank for prize" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check no pending/approved/paid request exists for this contest
    const { data: existingRequests } = await admin
      .from("payout_requests")
      .select("id, status, created_at")
      .eq("user_id", user.id)
      .eq("contest_id", contest_id);

    if (existingRequests && existingRequests.length > 0) {
      const hasApprovedOrPaid = existingRequests.some(
        (r) => r.status === "approved" || r.status === "paid"
      );
      if (hasApprovedOrPaid) {
        return new Response(
          JSON.stringify({ error: "এই মাসের জন্য আপনার পেআউট অনুরোধ ইতোমধ্যে অনুমোদিত হয়েছে। আপনি পরবর্তী মাসে আবার অনুরোধ পাঠাতে পারবেন।" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const hasPending = existingRequests.some((r) => r.status === "pending");
      if (hasPending) {
        return new Response(
          JSON.stringify({ error: "আপনার একটি পেন্ডিং পেআউট অনুরোধ আছে। অনুগ্রহ করে অপেক্ষা করুন।" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 3. 24-hour cooldown check (across all contests)
    const { data: lastRequest } = await admin
      .from("payout_requests")
      .select("created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastRequest) {
      const lastTime = new Date(lastRequest.created_at).getTime();
      const now = Date.now();
      if (now - lastTime < 24 * 60 * 60 * 1000) {
        return new Response(
          JSON.stringify({ error: "আপনি ইতোমধ্যে একটি পেআউট অনুরোধ পাঠিয়েছেন। নতুন অনুরোধ পাঠাতে ২৪ ঘণ্টা অপেক্ষা করতে হবে।" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // 4. Insert payout request
    const { error: insertError } = await admin.from("payout_requests").insert({
      user_id: user.id,
      contest_id,
      prize_amount: prizeAmount,
      final_rank: winner.final_rank,
      payment_method,
      account_number,
    });

    if (insertError) {
      return new Response(
        JSON.stringify({ error: "সাবমিট করতে সমস্যা হয়েছে: " + insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, prize_amount: prizeAmount, final_rank: winner.final_rank }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal error: " + (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
