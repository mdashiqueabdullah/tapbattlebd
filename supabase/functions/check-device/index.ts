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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { device_fingerprint, email } = await req.json();
    
    if (!device_fingerprint) {
      return new Response(JSON.stringify({ error: 'Device fingerprint required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if device already registered
    const { data: existing } = await supabase
      .from('device_registrations')
      .select('id, user_id')
      .eq('device_fingerprint', device_fingerprint)
      .maybeSingle();

    if (existing) {
      // Log blocked signup attempt
      await supabase.from('blocked_signups').insert({
        reason: 'duplicate_device',
        email: email || null,
        device_fingerprint,
      });

      return new Response(JSON.stringify({ 
        allowed: false, 
        error: 'এই ডিভাইস থেকে ইতিমধ্যে একটি অ্যাকাউন্ট তৈরি করা হয়েছে।' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ allowed: true }), {
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
