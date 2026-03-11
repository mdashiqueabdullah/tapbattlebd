
CREATE OR REPLACE FUNCTION public.complete_referral_on_email_confirm(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referrals
  SET status = 'completed', points_awarded = 5000
  WHERE referred_user_id = _user_id
    AND status = 'pending';

  UPDATE public.profiles
  SET referral_points = referral_points + 5000
  WHERE id = (
    SELECT referrer_user_id FROM public.referrals
    WHERE referred_user_id = _user_id AND status = 'completed'
    LIMIT 1
  );
END;
$$;
