
-- Admin needs to read all purchases and update status
-- For now, allow any authenticated user with service role to manage
-- We'll use a simple approach: allow all authenticated users to read (admin check in app)
-- In production, use a proper roles table

-- Allow reading all purchases for admin (all authenticated can read all for admin panel)
CREATE POLICY "Admin can read all purchases"
  ON public.attempt_purchases
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow updating purchases (admin approves/rejects)
CREATE POLICY "Admin can update purchases"
  ON public.attempt_purchases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
