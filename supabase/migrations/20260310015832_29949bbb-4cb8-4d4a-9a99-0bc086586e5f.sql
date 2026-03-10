
-- Create attempt_purchases table
CREATE TABLE public.attempt_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_method text NOT NULL CHECK (payment_method IN ('bkash', 'nagad')),
  transaction_id text NOT NULL,
  amount integer NOT NULL DEFAULT 30,
  attempts_count integer NOT NULL DEFAULT 5,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_transaction_id UNIQUE (transaction_id)
);

-- Add extra_attempts column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS extra_attempts integer NOT NULL DEFAULT 0;

-- Enable RLS
ALTER TABLE public.attempt_purchases ENABLE ROW LEVEL SECURITY;

-- Users can read their own purchases
CREATE POLICY "Users can read own purchases"
  ON public.attempt_purchases
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can insert their own purchases
CREATE POLICY "Users can insert own purchases"
  ON public.attempt_purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
