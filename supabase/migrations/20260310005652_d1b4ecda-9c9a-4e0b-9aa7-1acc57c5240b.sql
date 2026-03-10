
-- Generate unique referral code function
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text,
  full_name text,
  phone_number text UNIQUE,
  phone_verified boolean NOT NULL DEFAULT false,
  referral_code text UNIQUE NOT NULL DEFAULT public.generate_referral_code(),
  referred_by_user_id uuid REFERENCES public.profiles(id),
  referral_points integer NOT NULL DEFAULT 0,
  preferred_payout_method text,
  bkash_number text,
  nagad_number text,
  country text DEFAULT 'Bangladesh',
  preferred_language text DEFAULT 'bn',
  is_banned boolean NOT NULL DEFAULT false,
  avatar_url text,
  total_ranked_games integer NOT NULL DEFAULT 0,
  total_practice_games integer NOT NULL DEFAULT 0,
  lifetime_best_score integer NOT NULL DEFAULT 0,
  total_wins integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read other profiles username and referral_code" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

-- Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_user_id uuid NOT NULL REFERENCES public.profiles(id),
  points_awarded integer NOT NULL DEFAULT 0,
  phone_verified boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own referrals as referrer" ON public.referrals
  FOR SELECT TO authenticated
  USING (referrer_user_id = auth.uid());

CREATE POLICY "Users can read own referral as referred" ON public.referrals
  FOR SELECT TO authenticated
  USING (referred_user_id = auth.uid());

-- OTP verifications table
CREATE TABLE public.otp_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  otp_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own OTP records" ON public.otp_verifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Trigger: auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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

  INSERT INTO public.profiles (id, username, email, referral_code, referred_by_user_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    ref_code,
    referrer_id
  );

  -- Create pending referral record
  IF referrer_id IS NOT NULL THEN
    INSERT INTO public.referrals (referrer_user_id, referred_user_id, status)
    VALUES (referrer_id, NEW.id, 'pending');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to complete referral after phone verification
CREATE OR REPLACE FUNCTION public.complete_referral_on_phone_verify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.phone_verified = true AND OLD.phone_verified = false THEN
    UPDATE public.referrals
    SET phone_verified = true,
        points_awarded = 20,
        status = 'completed'
    WHERE referred_user_id = NEW.id
      AND status = 'pending';

    UPDATE public.profiles
    SET referral_points = referral_points + 20
    WHERE id = (
      SELECT referrer_user_id FROM public.referrals
      WHERE referred_user_id = NEW.id AND status = 'completed'
      LIMIT 1
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_phone_verified
  AFTER UPDATE OF phone_verified ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.complete_referral_on_phone_verify();
