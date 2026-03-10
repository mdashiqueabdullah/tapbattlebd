-- Allow admin to delete winners for re-finalization
CREATE POLICY "Admin can delete winners"
ON public.monthly_winners
FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));