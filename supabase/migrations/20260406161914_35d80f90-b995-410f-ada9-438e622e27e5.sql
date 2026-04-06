-- Equipment: allow farm members to view
DROP POLICY "Users can view own equipment" ON public.equipment;
CREATE POLICY "Users can view accessible equipment" ON public.equipment
  FOR SELECT USING (
    owner_id = auth.uid()
    OR (farm_id IS NOT NULL AND is_farm_member(farm_id))
  );

-- Interventions: allow farm members to view
DROP POLICY "Interventions viewable by owner" ON public.interventions;
CREATE POLICY "Interventions viewable by owner or farm member" ON public.interventions
  FOR SELECT USING (
    owner_id = auth.uid()
    OR (equipment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = interventions.equipment_id
      AND e.farm_id IS NOT NULL
      AND is_farm_member(e.farm_id)
    ))
  );

-- Maintenance tasks: allow farm members to view
DROP POLICY "Maintenance tasks viewable by owner" ON public.maintenance_tasks;
CREATE POLICY "Maintenance tasks viewable by owner or farm member" ON public.maintenance_tasks
  FOR SELECT USING (
    owner_id = auth.uid()
    OR (equipment_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.equipment e
      WHERE e.id = maintenance_tasks.equipment_id
      AND e.farm_id IS NOT NULL
      AND is_farm_member(e.farm_id)
    ))
  );

-- Parts inventory: allow farm members to view
DROP POLICY "Parts viewable by owner" ON public.parts_inventory;
CREATE POLICY "Parts viewable by owner or farm member" ON public.parts_inventory
  FOR SELECT USING (
    owner_id = auth.uid()
    OR (farm_id IS NOT NULL AND is_farm_member(farm_id))
  );