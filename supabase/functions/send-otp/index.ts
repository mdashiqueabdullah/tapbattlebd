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
    const sslApiKey = Deno.env.get('SSL_WIRELESS_API_KEY');
    const sslSid = Deno.env.get('SSL_WIRELESS_SID');

    if (!sslApiKey || !sslSid) {
      throw new Error('SSL Wireless credentials not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) throw new Error('Unauthorized');

    const { phone_number } = await req.json();
    if (!phone_number || typeof phone_number !== 'string') {
      throw new Error('Phone number is required');
    }

    // Validate BD phone format
    const cleaned = phone_number.replace(/\D/g, '');
    if (!/^01[3-9]\d{8}$/.test(cleaned)) {
      throw new Error('Invalid Bangladesh phone number. Use format: 01XXXXXXXXX');
    }

    // Check if phone already used by another user
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone_number', cleaned)
      .neq('id', user.id)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ error: 'এই ফোন নম্বর ইতিমধ্যে ব্যবহৃত হয়েছে' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

    // Store OTP
    await supabase.from('otp_verifications').insert({
      user_id: user.id,
      phone_number: cleaned,
      otp_code: otp,
      expires_at: expiresAt,
      verified: false,
    });

    // Send SMS via SSL Wireless
    const smsUrl = `https://smsplus.sslwireless.com/api/v3/send-sms`;
    const smsBody = {
      api_token: sslApiKey,
      sid: sslSid,
      msisdn: `88${cleaned}`,
      sms: `আপনার Tap Battle BD ভেরিফিকেশন কোড: ${otp}। ৫ মিনিটের মধ্যে ব্যবহার করুন।`,
      csms_id: `otp_${user.id}_${Date.now()}`,
    };

    const smsRes = await fetch(smsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(smsBody),
    });

    if (!smsRes.ok) {
      const errorText = await smsRes.text();
      console.error('SSL Wireless SMS failed:', errorText);
      throw new Error('SMS পাঠাতে ব্যর্থ হয়েছে');
    }

    return new Response(JSON.stringify({ success: true, message: 'OTP পাঠানো হয়েছে' }), {
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
