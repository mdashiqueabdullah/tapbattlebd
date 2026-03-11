-- Create device_registrations table
CREATE TABLE public.device_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read device registrations"
ON public.device_registrations FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Anon can insert device registrations"
ON public.device_registrations FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated can insert device registrations"
ON public.device_registrations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create blocked_signups table
CREATE TABLE public.blocked_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reason text NOT NULL,
  email text,
  device_fingerprint text,
  ip_address text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.blocked_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read blocked signups"
ON public.blocked_signups FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Anon can insert blocked signups"
ON public.blocked_signups FOR INSERT
TO anon
WITH CHECK (true);

-- Create referral completion function for email verification
CREATE OR REPLACE FUNCTION public.complete_referral_on_email_confirm(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.referrals
  SET phone_verified = true,
      points_awarded = 20,
      status = 'completed'
  WHERE referred_user_id = _user_id
    AND status = 'pending';

  UPDATE public.profiles
  SET referral_points = referral_points + 20
  WHERE id = (
    SELECT referrer_user_id FROM public.referrals
    WHERE referred_user_id = _user_id AND status = 'completed'
    LIMIT 1
  );
END;
$function$;