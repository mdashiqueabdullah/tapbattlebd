import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { phone_number, otp_code } = await req.json();
    if (!phone_number || !otp_code) throw new Error('Phone number and OTP are required');

    const cleaned = phone_number.replace(/\D/g, '');

    // Find valid OTP
    const { data: otpRecord } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('phone_number', cleaned)
      .eq('otp_code', otp_code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!otpRecord) {
      return new Response(JSON.stringify({ error: 'ভুল বা মেয়াদোত্তীর্ণ OTP কোড' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark OTP as verified
    await supabase.from('otp_verifications')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Update profile — phone_verified trigger will handle referral points
    await supabase.from('profiles')
      .update({ phone_number: cleaned, phone_verified: true })
      .eq('id', user.id);

    return new Response(JSON.stringify({ success: true, message: 'ফোন নম্বর ভেরিফাই হয়েছে!' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
