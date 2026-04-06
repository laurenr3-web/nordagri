-- Allow users to view invitations addressed to their email
CREATE POLICY "Users can view own invitations by email"
ON public.invitations
FOR SELECT
TO authenticated
USING (
  email = (SELECT email FROM auth.users WHERE id = auth.uid())
);
