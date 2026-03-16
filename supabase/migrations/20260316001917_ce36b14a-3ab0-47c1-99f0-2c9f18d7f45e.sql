CREATE POLICY "Anon can read referral codes"
ON public.profiles
FOR SELECT
TO anon
USING (true);