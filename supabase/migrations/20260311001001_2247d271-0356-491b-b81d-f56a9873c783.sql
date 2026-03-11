-- Update handle_new_user to store phone_number from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  ref_code text;
  referrer_id uuid;
BEGIN
  -- Generate unique referral code
  LOOP
    ref_code := public.generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = ref_code);
  END LOOP;

  -- Check if referred_by metadata exists
  referrer_id := NULL;
  IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL THEN
    SELECT id INTO referrer_id FROM public.profiles
    WHERE referral_code = (NEW.raw_user_meta_data->>'referred_by')
    AND id != NEW.id;
  END IF;

  INSERT INTO public.profiles (id, username, email, referral_code, referred_by_user_id, phone_number)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    ref_code,
    referrer_id,
    NULLIF(NEW.raw_user_meta_data->>'phone_number', '')
  );

  -- Create pending referral record
  IF referrer_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_user_id, referred_user_id, status)
    VALUES (referrer_id, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$function$;