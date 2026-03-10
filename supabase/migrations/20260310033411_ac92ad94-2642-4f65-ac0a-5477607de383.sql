
-- Game sessions table for anti-cheat tracking
CREATE TABLE public.game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  is_practice boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  client_score integer DEFAULT 0,
  verified_score integer DEFAULT NULL,
  tap_count integer DEFAULT 0,
  avg_interval_ms numeric DEFAULT 0,
  interval_variance numeric DEFAULT 0,
  min_interval_ms numeric DEFAULT 0,
  max_interval_ms numeric DEFAULT 0,
  bot_risk_score numeric DEFAULT 0,
  visibility_changes integer DEFAULT 0,
  focus_losses integer DEFAULT 0,
  ip_address text DEFAULT NULL,
  user_agent text DEFAULT NULL,
  screen_width integer DEFAULT NULL,
  screen_height integer DEFAULT NULL,
  timezone text DEFAULT NULL,
  flagged boolean DEFAULT false,
  flag_reasons text[] DEFAULT '{}',
  review_status text DEFAULT 'pending',
  reviewed_by uuid DEFAULT NULL,
  reviewed_at timestamptz DEFAULT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Rate limiting table
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  action text NOT NULL,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_rate_limits_identifier_action ON public.rate_limits (identifier, action, window_start);
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions (user_id);
CREATE INDEX idx_game_sessions_status ON public.game_sessions (status);
CREATE INDEX idx_game_sessions_flagged ON public.game_sessions (flagged);
CREATE INDEX idx_game_sessions_session_token ON public.game_sessions (session_token);

-- RLS for game_sessions
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sessions"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own sessions"
  ON public.game_sessions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own active sessions"
  ON public.game_sessions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'active')
  WITH CHECK (user_id = auth.uid());

-- Admin read all sessions (for admin panel)
CREATE POLICY "Admin can read all sessions"
  ON public.game_sessions FOR SELECT
  TO authenticated
  USING (true);

-- RLS for rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Rate limits managed by edge functions only, no direct client access needed
