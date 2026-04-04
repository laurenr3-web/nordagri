
-- Fix equipment_logs INSERT policy to enforce user_id integrity
DROP POLICY IF EXISTS "Equipment logs insertable by equipment owner" ON public.equipment_logs;
CREATE POLICY "Equipment logs insertable by equipment owner"
  ON public.equipment_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owns_equipment(equipment_id)
    AND (user_id = auth.uid() OR user_id IS NULL)
  );
