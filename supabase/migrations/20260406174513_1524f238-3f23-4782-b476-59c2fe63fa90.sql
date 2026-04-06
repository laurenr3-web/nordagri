
-- 1. Create has_farm_role function
CREATE OR REPLACE FUNCTION public.has_farm_role(_farm_id uuid, _min_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    EXISTS (
      SELECT 1 FROM public.farms
      WHERE id = _farm_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.farm_members
      WHERE farm_id = _farm_id
        AND user_id = auth.uid()
        AND (
          CASE role
            WHEN 'admin' THEN 3
            WHEN 'member' THEN 2
            WHEN 'viewer' THEN 1
            ELSE 0
          END
        ) >= (
          CASE _min_role
            WHEN 'admin' THEN 3
            WHEN 'member' THEN 2
            WHEN 'viewer' THEN 1
            ELSE 0
          END
        )
    );
$$;

-- 2. Create can_write_equipment function
CREATE OR REPLACE FUNCTION public.can_write_equipment(_equipment_id integer, _min_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.equipment
    WHERE id = _equipment_id
      AND (
        owner_id = auth.uid()
        OR (farm_id IS NOT NULL AND public.has_farm_role(farm_id, _min_role))
      )
  );
$$;

-- ============================================================
-- 3. EQUIPMENT policies (has owner_id, farm_id)
-- ============================================================
DROP POLICY IF EXISTS "Users can create equipment" ON public.equipment;
CREATE POLICY "Users can create equipment" ON public.equipment FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Users can update own equipment" ON public.equipment;
CREATE POLICY "Users can update own equipment" ON public.equipment FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Users can delete own equipment" ON public.equipment;
CREATE POLICY "Users can delete own equipment" ON public.equipment FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'admin')));

-- ============================================================
-- 4. PARTS_INVENTORY policies (has owner_id, farm_id)
-- ============================================================
DROP POLICY IF EXISTS "Parts insertable by authenticated" ON public.parts_inventory;
CREATE POLICY "Parts insertable by authenticated" ON public.parts_inventory FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Parts updatable by owner" ON public.parts_inventory;
CREATE POLICY "Parts updatable by owner" ON public.parts_inventory FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Parts deletable by owner" ON public.parts_inventory;
CREATE POLICY "Parts deletable by owner" ON public.parts_inventory FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'admin')));

-- ============================================================
-- 5. FUEL_LOGS policies (has created_by, farm_id)
-- ============================================================
DROP POLICY IF EXISTS "Fuel logs insertable by farm member" ON public.fuel_logs;
CREATE POLICY "Fuel logs insertable by farm member" ON public.fuel_logs FOR INSERT TO authenticated
WITH CHECK ((created_by = auth.uid()) AND ((farm_id IS NULL) OR has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Fuel logs updatable by creator" ON public.fuel_logs;
CREATE POLICY "Fuel logs updatable by creator" ON public.fuel_logs FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Fuel logs deletable by creator" ON public.fuel_logs;
CREATE POLICY "Fuel logs deletable by creator" ON public.fuel_logs FOR DELETE TO authenticated
USING (created_by = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'admin')));

-- ============================================================
-- 6. INTERVENTIONS policies (has owner_id, linked via equipment_id)
-- ============================================================
DROP POLICY IF EXISTS "Interventions insertable by owner" ON public.interventions;
CREATE POLICY "Interventions insertable by owner" ON public.interventions FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  OR (equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM equipment e WHERE e.id = interventions.equipment_id
      AND e.farm_id IS NOT NULL AND has_farm_role(e.farm_id, 'member')
  ))
);

DROP POLICY IF EXISTS "Interventions updatable by owner" ON public.interventions;
CREATE POLICY "Interventions updatable by owner" ON public.interventions FOR UPDATE TO authenticated
USING (
  owner_id = auth.uid()
  OR (equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM equipment e WHERE e.id = interventions.equipment_id
      AND e.farm_id IS NOT NULL AND has_farm_role(e.farm_id, 'member')
  ))
);

DROP POLICY IF EXISTS "Interventions deletable by owner" ON public.interventions;
CREATE POLICY "Interventions deletable by owner" ON public.interventions FOR DELETE TO authenticated
USING (
  owner_id = auth.uid()
  OR (equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM equipment e WHERE e.id = interventions.equipment_id
      AND e.farm_id IS NOT NULL AND has_farm_role(e.farm_id, 'admin')
  ))
);

-- ============================================================
-- 7. MAINTENANCE_TASKS policies (has owner_id, linked via equipment_id)
-- ============================================================
DROP POLICY IF EXISTS "Maintenance tasks insertable by authenticated" ON public.maintenance_tasks;
CREATE POLICY "Maintenance tasks insertable by authenticated" ON public.maintenance_tasks FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  OR (equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM equipment e WHERE e.id = maintenance_tasks.equipment_id
      AND e.farm_id IS NOT NULL AND has_farm_role(e.farm_id, 'member')
  ))
);

DROP POLICY IF EXISTS "Maintenance tasks updatable by owner" ON public.maintenance_tasks;
CREATE POLICY "Maintenance tasks updatable by owner" ON public.maintenance_tasks FOR UPDATE TO authenticated
USING (
  owner_id = auth.uid()
  OR (equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM equipment e WHERE e.id = maintenance_tasks.equipment_id
      AND e.farm_id IS NOT NULL AND has_farm_role(e.farm_id, 'member')
  ))
);

DROP POLICY IF EXISTS "Maintenance tasks deletable by owner" ON public.maintenance_tasks;
CREATE POLICY "Maintenance tasks deletable by owner" ON public.maintenance_tasks FOR DELETE TO authenticated
USING (
  owner_id = auth.uid()
  OR (equipment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM equipment e WHERE e.id = maintenance_tasks.equipment_id
      AND e.farm_id IS NOT NULL AND has_farm_role(e.farm_id, 'admin')
  ))
);

-- ============================================================
-- 8. MAINTENANCE_PLANS policies (has owner_id, farm_id)
-- ============================================================
DROP POLICY IF EXISTS "Maintenance plans insertable by owner" ON public.maintenance_plans;
CREATE POLICY "Maintenance plans insertable by owner" ON public.maintenance_plans FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Maintenance plans updatable by owner or farm member" ON public.maintenance_plans;
CREATE POLICY "Maintenance plans updatable by owner or farm member" ON public.maintenance_plans FOR UPDATE TO authenticated
USING (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'member')));

DROP POLICY IF EXISTS "Maintenance plans deletable by owner" ON public.maintenance_plans;
CREATE POLICY "Maintenance plans deletable by owner" ON public.maintenance_plans FOR DELETE TO authenticated
USING (owner_id = auth.uid() OR (farm_id IS NOT NULL AND has_farm_role(farm_id, 'admin')));

-- ============================================================
-- 9. EQUIPMENT_LOGS policies
-- ============================================================
DROP POLICY IF EXISTS "Equipment logs insertable by equipment owner" ON public.equipment_logs;
CREATE POLICY "Equipment logs insertable by equipment owner" ON public.equipment_logs FOR INSERT TO authenticated
WITH CHECK (can_write_equipment(equipment_id, 'member') AND (user_id = auth.uid() OR user_id IS NULL));

DROP POLICY IF EXISTS "Equipment logs updatable by equipment owner" ON public.equipment_logs;
CREATE POLICY "Equipment logs updatable by equipment owner" ON public.equipment_logs FOR UPDATE TO authenticated
USING (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "Equipment logs deletable by equipment owner" ON public.equipment_logs;
CREATE POLICY "Equipment logs deletable by equipment owner" ON public.equipment_logs FOR DELETE TO authenticated
USING (can_write_equipment(equipment_id, 'admin'));

-- ============================================================
-- 10. EQUIPMENT_PHOTOS policies
-- ============================================================
DROP POLICY IF EXISTS "Equipment photos insertable by equipment owner" ON public.equipment_photos;
CREATE POLICY "Equipment photos insertable by equipment owner" ON public.equipment_photos FOR INSERT TO authenticated
WITH CHECK (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "Equipment photos updatable by equipment owner" ON public.equipment_photos;
CREATE POLICY "Equipment photos updatable by equipment owner" ON public.equipment_photos FOR UPDATE TO authenticated
USING (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "Equipment photos deletable by equipment owner" ON public.equipment_photos;
CREATE POLICY "Equipment photos deletable by equipment owner" ON public.equipment_photos FOR DELETE TO authenticated
USING (can_write_equipment(equipment_id, 'admin'));

-- ============================================================
-- 11. EQUIPMENT_MAINTENANCE_SCHEDULE policies
-- ============================================================
DROP POLICY IF EXISTS "Maintenance schedule insertable by equipment owner" ON public.equipment_maintenance_schedule;
CREATE POLICY "Maintenance schedule insertable by equipment owner" ON public.equipment_maintenance_schedule FOR INSERT TO authenticated
WITH CHECK (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "Maintenance schedule updatable by equipment owner" ON public.equipment_maintenance_schedule;
CREATE POLICY "Maintenance schedule updatable by equipment owner" ON public.equipment_maintenance_schedule FOR UPDATE TO authenticated
USING (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "Maintenance schedule deletable by equipment owner" ON public.equipment_maintenance_schedule;
CREATE POLICY "Maintenance schedule deletable by equipment owner" ON public.equipment_maintenance_schedule FOR DELETE TO authenticated
USING (can_write_equipment(equipment_id, 'admin'));

-- ============================================================
-- 12. EQUIPMENT_QRCODES policies
-- ============================================================
DROP POLICY IF EXISTS "QR codes insertable by equipment owner" ON public.equipment_qrcodes;
CREATE POLICY "QR codes insertable by equipment owner" ON public.equipment_qrcodes FOR INSERT TO authenticated
WITH CHECK (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "QR codes updatable by equipment owner" ON public.equipment_qrcodes;
CREATE POLICY "QR codes updatable by equipment owner" ON public.equipment_qrcodes FOR UPDATE TO authenticated
USING (can_write_equipment(equipment_id, 'member'));

DROP POLICY IF EXISTS "QR codes deletable by equipment owner" ON public.equipment_qrcodes;
CREATE POLICY "QR codes deletable by equipment owner" ON public.equipment_qrcodes FOR DELETE TO authenticated
USING (can_write_equipment(equipment_id, 'admin'));

-- ============================================================
-- 13. PLANNING_TASKS policies
-- ============================================================
DROP POLICY IF EXISTS "Planning tasks insertable by farm member" ON public.planning_tasks;
CREATE POLICY "Planning tasks insertable by farm member" ON public.planning_tasks FOR INSERT TO authenticated
WITH CHECK (has_farm_role(farm_id, 'member') AND created_by = auth.uid());

DROP POLICY IF EXISTS "Planning tasks updatable by farm member" ON public.planning_tasks;
CREATE POLICY "Planning tasks updatable by farm member" ON public.planning_tasks FOR UPDATE TO authenticated
USING (has_farm_role(farm_id, 'member'));

DROP POLICY IF EXISTS "Planning tasks deletable by farm member" ON public.planning_tasks;
CREATE POLICY "Planning tasks deletable by farm member" ON public.planning_tasks FOR DELETE TO authenticated
USING (has_farm_role(farm_id, 'admin') OR created_by = auth.uid());

-- ============================================================
-- 14. PLANNING_CATEGORY_IMPORTANCE policies
-- ============================================================
DROP POLICY IF EXISTS "Category importance insertable by farm member" ON public.planning_category_importance;
CREATE POLICY "Category importance insertable by farm member" ON public.planning_category_importance FOR INSERT TO authenticated
WITH CHECK (has_farm_role(farm_id, 'admin'));

DROP POLICY IF EXISTS "Category importance updatable by farm member" ON public.planning_category_importance;
CREATE POLICY "Category importance updatable by farm member" ON public.planning_category_importance FOR UPDATE TO authenticated
USING (has_farm_role(farm_id, 'admin'));

DROP POLICY IF EXISTS "Category importance deletable by farm member" ON public.planning_category_importance;
CREATE POLICY "Category importance deletable by farm member" ON public.planning_category_importance FOR DELETE TO authenticated
USING (has_farm_role(farm_id, 'admin'));
