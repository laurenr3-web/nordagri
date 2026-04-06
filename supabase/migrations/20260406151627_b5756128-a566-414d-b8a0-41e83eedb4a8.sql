DROP POLICY IF EXISTS "Users can view own invitations by email" ON public.invitations;

CREATE POLICY "Users can view own invitations by email" 
ON public.invitations FOR SELECT TO authenticated 
USING (
  email = (SELECT auth.email())
);