
-- Add missing columns to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS daily_streak_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_points integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bonus_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Create user_roles table for admin role checks (security best practice)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Create monthly_contests table
CREATE TABLE IF NOT EXISTS public.monthly_contests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month integer NOT NULL,
  year integer NOT NULL,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  prize_pool numeric NOT NULL DEFAULT 15000,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(month, year)
);
ALTER TABLE public.monthly_contests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read contests" ON public.monthly_contests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read contests" ON public.monthly_contests FOR SELECT TO anon USING (true);

-- Create attempts table
CREATE TABLE IF NOT EXISTS public.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contest_id uuid REFERENCES public.monthly_contests(id) ON DELETE CASCADE NOT NULL,
  attempt_number integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  session_id uuid REFERENCES public.game_sessions(id),
  session_started_at timestamptz DEFAULT now(),
  session_ended_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own attempts" ON public.attempts FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Create leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contest_id uuid REFERENCES public.monthly_contests(id) ON DELETE CASCADE NOT NULL,
  attempt_total_score integer NOT NULL DEFAULT 0,
  referral_points integer NOT NULL DEFAULT 0,
  daily_streak_points integer NOT NULL DEFAULT 0,
  total_score integer NOT NULL DEFAULT 0,
  attempts_used integer NOT NULL DEFAULT 0,
  rank_position integer,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contest_id)
);
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read leaderboard" ON public.leaderboard FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read leaderboard" ON public.leaderboard FOR SELECT TO anon USING (true);

-- Create daily_claims table
CREATE TABLE IF NOT EXISTS public.daily_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  claim_date date NOT NULL,
  reward_points integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, claim_date)
);
ALTER TABLE public.daily_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own claims" ON public.daily_claims FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own claims" ON public.daily_claims FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create payout_requests table
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contest_id uuid REFERENCES public.monthly_contests(id) ON DELETE CASCADE,
  prize_amount numeric NOT NULL,
  payment_method text NOT NULL,
  account_number text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own payouts" ON public.payout_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own payouts" ON public.payout_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Create monthly_winners table
CREATE TABLE IF NOT EXISTS public.monthly_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  contest_id uuid REFERENCES public.monthly_contests(id) ON DELETE CASCADE NOT NULL,
  final_rank integer NOT NULL,
  prize_amount numeric NOT NULL,
  payout_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, contest_id)
);
ALTER TABLE public.monthly_winners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read winners" ON public.monthly_winners FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read winners" ON public.monthly_winners FOR SELECT TO anon USING (true);

-- Create admin_logs table
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES public.profiles(id),
  action text NOT NULL,
  target_table text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_contest_id ON public.attempts(contest_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_score ON public.leaderboard(total_score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_contest_id ON public.leaderboard(contest_id);
CREATE INDEX IF NOT EXISTS idx_daily_claims_user_id ON public.daily_claims(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_claims_date ON public.daily_claims(claim_date);
CREATE INDEX IF NOT EXISTS idx_payout_requests_user_id ON public.payout_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_winners_contest_id ON public.monthly_winners(contest_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON public.admin_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable realtime for leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard;

-- Security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Admin RLS policies using is_admin function
CREATE POLICY "Admin can read all attempts" ON public.attempts FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin can read all payouts" ON public.payout_requests FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin can update payouts" ON public.payout_requests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin can read logs" ON public.admin_logs FOR SELECT TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin can insert logs" ON public.admin_logs FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin can insert winners" ON public.monthly_winners FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin can update winners" ON public.monthly_winners FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin can insert contests" ON public.monthly_contests FOR INSERT TO authenticated WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin can update contests" ON public.monthly_contests FOR UPDATE TO authenticated USING (public.is_admin(auth.uid()));

-- Function to get or create current month's contest
CREATE OR REPLACE FUNCTION public.get_or_create_current_contest()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contest_id uuid;
  current_month integer;
  current_year integer;
  month_start timestamptz;
  month_end timestamptz;
BEGIN
  current_month := EXTRACT(MONTH FROM now() AT TIME ZONE 'Asia/Dhaka');
  current_year := EXTRACT(YEAR FROM now() AT TIME ZONE 'Asia/Dhaka');
  
  SELECT id INTO contest_id FROM public.monthly_contests
  WHERE month = current_month AND year = current_year;
  
  IF contest_id IS NULL THEN
    month_start := make_timestamptz(current_year, current_month, 1, 0, 0, 0, 'Asia/Dhaka');
    month_end := (month_start + interval '1 month') - interval '1 second';
    
    INSERT INTO public.monthly_contests (month, year, start_at, end_at)
    VALUES (current_month, current_year, month_start, month_end)
    RETURNING id INTO contest_id;
  END IF;
  
  RETURN contest_id;
END;
$$;

-- Function to update leaderboard scores for a user+contest
CREATE OR REPLACE FUNCTION public.update_leaderboard_scores(_user_id uuid, _contest_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _attempt_total integer;
  _ref_points integer;
  _streak_points integer;
  _attempts_used integer;
BEGIN
  SELECT COALESCE(SUM(score), 0), COUNT(*)::integer 
  INTO _attempt_total, _attempts_used
  FROM public.attempts WHERE user_id = _user_id AND contest_id = _contest_id;
  
  SELECT COALESCE(referral_points, 0) INTO _ref_points
  FROM public.profiles WHERE id = _user_id;
  
  SELECT COALESCE(SUM(reward_points), 0) INTO _streak_points
  FROM public.daily_claims WHERE user_id = _user_id
  AND EXTRACT(MONTH FROM claim_date) = EXTRACT(MONTH FROM now() AT TIME ZONE 'Asia/Dhaka')
  AND EXTRACT(YEAR FROM claim_date) = EXTRACT(YEAR FROM now() AT TIME ZONE 'Asia/Dhaka');
  
  INSERT INTO public.leaderboard (user_id, contest_id, attempt_total_score, referral_points, daily_streak_points, total_score, attempts_used)
  VALUES (_user_id, _contest_id, _attempt_total, _ref_points, _streak_points, _attempt_total + _ref_points + _streak_points, _attempts_used)
  ON CONFLICT (user_id, contest_id)
  DO UPDATE SET
    attempt_total_score = EXCLUDED.attempt_total_score,
    referral_points = EXCLUDED.referral_points,
    daily_streak_points = EXCLUDED.daily_streak_points,
    total_score = EXCLUDED.attempt_total_score + EXCLUDED.referral_points + EXCLUDED.daily_streak_points,
    attempts_used = EXCLUDED.attempts_used,
    updated_at = now();
END;
$$;

-- Function to get user attempt count for a contest
CREATE OR REPLACE FUNCTION public.get_user_attempt_count(_user_id uuid, _contest_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer FROM public.attempts
  WHERE user_id = _user_id AND contest_id = _contest_id;
$$;
