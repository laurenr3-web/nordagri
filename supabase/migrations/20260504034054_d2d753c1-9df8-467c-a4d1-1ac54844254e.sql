DROP POLICY IF EXISTS "Time sessions viewable by owner" ON public.time_sessions;

CREATE POLICY "Time sessions viewable by farm member"
ON public.time_sessions
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.farm_members fm_self
    JOIN public.farm_members fm_other ON fm_self.farm_id = fm_other.farm_id
    WHERE fm_self.user_id = auth.uid()
      AND fm_other.user_id = time_sessions.user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.farms f
    JOIN public.farm_members fm ON fm.farm_id = f.id
    WHERE f.owner_id = auth.uid()
      AND fm.user_id = time_sessions.user_id
  )
  OR EXISTS (
    SELECT 1
    FROM public.farms f
    JOIN public.farm_members fm ON fm.farm_id = f.id
    WHERE fm.user_id = auth.uid()
      AND f.owner_id = time_sessions.user_id
  )
);