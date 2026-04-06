DROP POLICY "Users can view own farms" ON public.farms;
CREATE POLICY "Users can view accessible farms" ON public.farms
  FOR SELECT USING (
    owner_id = auth.uid()
    OR is_farm_member(id)
  );