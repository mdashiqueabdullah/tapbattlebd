
CREATE OR REPLACE FUNCTION public.complete_referral_on_email_confirm(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _referrer_id uuid;
BEGIN
  -- Find the pending referral and get the referrer, if none exists do nothing
  SELECT referrer_user_id INTO _referrer_id
  FROM public.referrals
  WHERE referred_user_id = _user_id
    AND status = 'pending'
  LIMIT 1;

  -- If no pending referral found, exit (idempotent - already completed or no referral)
  IF _referrer_id IS NULL THEN
    RETURN;
  END IF;

  -- Update referral to completed
  UPDATE public.referrals
  SET status = 'completed', points_awarded = 5000
  WHERE referred_user_id = _user_id
    AND status = 'pending';

  -- Add points to the referrer
  UPDATE public.profiles
  SET referral_points = referral_points + 5000
  WHERE id = _referrer_id;
END;
$function$;
