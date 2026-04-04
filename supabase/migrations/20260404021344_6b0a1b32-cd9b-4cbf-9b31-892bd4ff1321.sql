
-- 1. Create security definer function to check farm membership (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_farm_member(_farm_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.farm_members
    WHERE farm_id = _farm_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.farms
    WHERE id = _farm_id AND owner_id = auth.uid()
  );
$$;

-- 2. Create security definer function to check equipment ownership
CREATE OR REPLACE FUNCTION public.owns_equipment(_equipment_id integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.equipment
    WHERE id = _equipment_id AND owner_id = auth.uid()
  );
$$;

-- 3. Fix existing functions search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name');
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.decrement_part_stock(p_part_id integer, p_quantity integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.parts_inventory
  SET quantity = GREATEST(quantity - p_quantity, 0),
      updated_at = now()
  WHERE id = p_part_id;
END;
$function$;

-- ============================================================
-- INTERVENTIONS (owner_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Interventions manageable by authenticated" ON public.interventions;
DROP POLICY IF EXISTS "Interventions viewable by authenticated" ON public.interventions;

CREATE POLICY "Interventions viewable by owner" ON public.interventions
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Interventions insertable by owner" ON public.interventions
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Interventions updatable by owner" ON public.interventions
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Interventions deletable by owner" ON public.interventions
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- MAINTENANCE_PLANS (owner_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Maintenance plans manageable by authenticated" ON public.maintenance_plans;
DROP POLICY IF EXISTS "Maintenance plans viewable by authenticated" ON public.maintenance_plans;

CREATE POLICY "Maintenance plans viewable by owner" ON public.maintenance_plans
  FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Maintenance plans insertable by owner" ON public.maintenance_plans
  FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Maintenance plans updatable by owner" ON public.maintenance_plans
  FOR UPDATE TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Maintenance plans deletable by owner" ON public.maintenance_plans
  FOR DELETE TO authenticated USING (owner_id = auth.uid());

-- ============================================================
-- FUEL_LOGS (farm_id + created_by scoped)
-- ============================================================
DROP POLICY IF EXISTS "Fuel logs manageable by authenticated" ON public.fuel_logs;
DROP POLICY IF EXISTS "Fuel logs viewable by authenticated" ON public.fuel_logs;

CREATE POLICY "Fuel logs viewable by farm member" ON public.fuel_logs
  FOR SELECT TO authenticated
  USING ((farm_id IS NOT NULL AND public.is_farm_member(farm_id)) OR (farm_id IS NULL AND created_by = auth.uid()));
CREATE POLICY "Fuel logs insertable by farm member" ON public.fuel_logs
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND (farm_id IS NULL OR public.is_farm_member(farm_id)));
CREATE POLICY "Fuel logs updatable by creator" ON public.fuel_logs
  FOR UPDATE TO authenticated USING (created_by = auth.uid());
CREATE POLICY "Fuel logs deletable by creator" ON public.fuel_logs
  FOR DELETE TO authenticated USING (created_by = auth.uid());

-- ============================================================
-- PARTS_WITHDRAWALS (user_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Withdrawals manageable by authenticated" ON public.parts_withdrawals;
DROP POLICY IF EXISTS "Withdrawals viewable by authenticated" ON public.parts_withdrawals;

CREATE POLICY "Withdrawals viewable by owner" ON public.parts_withdrawals
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Withdrawals insertable by owner" ON public.parts_withdrawals
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Withdrawals updatable by owner" ON public.parts_withdrawals
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Withdrawals deletable by owner" ON public.parts_withdrawals
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================
-- EQUIPMENT_LOGS (via equipment ownership)
-- ============================================================
DROP POLICY IF EXISTS "Equipment logs manageable by authenticated" ON public.equipment_logs;
DROP POLICY IF EXISTS "Equipment logs viewable by authenticated" ON public.equipment_logs;

CREATE POLICY "Equipment logs viewable by equipment owner" ON public.equipment_logs
  FOR SELECT TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "Equipment logs insertable by equipment owner" ON public.equipment_logs
  FOR INSERT TO authenticated WITH CHECK (public.owns_equipment(equipment_id));
CREATE POLICY "Equipment logs updatable by equipment owner" ON public.equipment_logs
  FOR UPDATE TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "Equipment logs deletable by equipment owner" ON public.equipment_logs
  FOR DELETE TO authenticated USING (public.owns_equipment(equipment_id));

-- ============================================================
-- EQUIPMENT_PHOTOS (via equipment ownership)
-- ============================================================
DROP POLICY IF EXISTS "Equipment photos manageable by authenticated" ON public.equipment_photos;
DROP POLICY IF EXISTS "Equipment photos viewable by authenticated" ON public.equipment_photos;

CREATE POLICY "Equipment photos viewable by equipment owner" ON public.equipment_photos
  FOR SELECT TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "Equipment photos insertable by equipment owner" ON public.equipment_photos
  FOR INSERT TO authenticated WITH CHECK (public.owns_equipment(equipment_id));
CREATE POLICY "Equipment photos updatable by equipment owner" ON public.equipment_photos
  FOR UPDATE TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "Equipment photos deletable by equipment owner" ON public.equipment_photos
  FOR DELETE TO authenticated USING (public.owns_equipment(equipment_id));

-- ============================================================
-- EQUIPMENT_MAINTENANCE_SCHEDULE (via equipment ownership)
-- ============================================================
DROP POLICY IF EXISTS "Maintenance schedule manageable by authenticated" ON public.equipment_maintenance_schedule;
DROP POLICY IF EXISTS "Maintenance schedule viewable by authenticated" ON public.equipment_maintenance_schedule;

CREATE POLICY "Maintenance schedule viewable by equipment owner" ON public.equipment_maintenance_schedule
  FOR SELECT TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "Maintenance schedule insertable by equipment owner" ON public.equipment_maintenance_schedule
  FOR INSERT TO authenticated WITH CHECK (public.owns_equipment(equipment_id));
CREATE POLICY "Maintenance schedule updatable by equipment owner" ON public.equipment_maintenance_schedule
  FOR UPDATE TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "Maintenance schedule deletable by equipment owner" ON public.equipment_maintenance_schedule
  FOR DELETE TO authenticated USING (public.owns_equipment(equipment_id));

-- ============================================================
-- EQUIPMENT_QRCODES (via equipment ownership)
-- ============================================================
DROP POLICY IF EXISTS "QR codes manageable by authenticated" ON public.equipment_qrcodes;
DROP POLICY IF EXISTS "QR codes viewable by authenticated" ON public.equipment_qrcodes;

CREATE POLICY "QR codes viewable by equipment owner" ON public.equipment_qrcodes
  FOR SELECT TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "QR codes insertable by equipment owner" ON public.equipment_qrcodes
  FOR INSERT TO authenticated WITH CHECK (public.owns_equipment(equipment_id));
CREATE POLICY "QR codes updatable by equipment owner" ON public.equipment_qrcodes
  FOR UPDATE TO authenticated USING (public.owns_equipment(equipment_id));
CREATE POLICY "QR codes deletable by equipment owner" ON public.equipment_qrcodes
  FOR DELETE TO authenticated USING (public.owns_equipment(equipment_id));

-- ============================================================
-- TEAM_MEMBERS (farm_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Team members manageable by authenticated" ON public.team_members;
DROP POLICY IF EXISTS "Team members viewable by authenticated" ON public.team_members;

CREATE POLICY "Team members viewable by farm member" ON public.team_members
  FOR SELECT TO authenticated USING (public.is_farm_member(farm_id));
CREATE POLICY "Team members insertable by farm member" ON public.team_members
  FOR INSERT TO authenticated WITH CHECK (public.is_farm_member(farm_id));
CREATE POLICY "Team members updatable by farm member" ON public.team_members
  FOR UPDATE TO authenticated USING (public.is_farm_member(farm_id));
CREATE POLICY "Team members deletable by farm member" ON public.team_members
  FOR DELETE TO authenticated USING (public.is_farm_member(farm_id));

-- ============================================================
-- FARM_MEMBERS (farm owner manages, members can view)
-- ============================================================
DROP POLICY IF EXISTS "Farm members manageable by authenticated" ON public.farm_members;
DROP POLICY IF EXISTS "Farm members viewable by authenticated" ON public.farm_members;

CREATE POLICY "Farm members viewable by member" ON public.farm_members
  FOR SELECT TO authenticated USING (public.is_farm_member(farm_id));
CREATE POLICY "Farm members insertable by farm owner" ON public.farm_members
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );
CREATE POLICY "Farm members updatable by farm owner" ON public.farm_members
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );
CREATE POLICY "Farm members deletable by farm owner" ON public.farm_members
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );

-- ============================================================
-- INVITATIONS (farm owner manages, farm members can view)
-- ============================================================
DROP POLICY IF EXISTS "Invitations manageable by authenticated" ON public.invitations;
DROP POLICY IF EXISTS "Invitations viewable by authenticated" ON public.invitations;

CREATE POLICY "Invitations viewable by farm member" ON public.invitations
  FOR SELECT TO authenticated USING (public.is_farm_member(farm_id));
CREATE POLICY "Invitations insertable by farm owner" ON public.invitations
  FOR INSERT TO authenticated WITH CHECK (
    invited_by = auth.uid() AND
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );
CREATE POLICY "Invitations updatable by farm owner" ON public.invitations
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );
CREATE POLICY "Invitations deletable by farm owner" ON public.invitations
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );

-- ============================================================
-- FARM_SETTINGS (farm owner manages, farm members can view)
-- ============================================================
DROP POLICY IF EXISTS "Farm settings manageable by authenticated" ON public.farm_settings;
DROP POLICY IF EXISTS "Farm settings viewable by authenticated" ON public.farm_settings;

CREATE POLICY "Farm settings viewable by farm member" ON public.farm_settings
  FOR SELECT TO authenticated USING (public.is_farm_member(farm_id));
CREATE POLICY "Farm settings insertable by farm owner" ON public.farm_settings
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );
CREATE POLICY "Farm settings updatable by farm owner" ON public.farm_settings
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );
CREATE POLICY "Farm settings deletable by farm owner" ON public.farm_settings
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.farms WHERE id = farm_id AND owner_id = auth.uid())
  );

-- ============================================================
-- EQUIPMENT_TYPES (farm_id scoped, allow NULL farm_id for globals)
-- ============================================================
DROP POLICY IF EXISTS "Equipment types manageable by authenticated" ON public.equipment_types;
DROP POLICY IF EXISTS "Equipment types viewable by authenticated" ON public.equipment_types;

CREATE POLICY "Equipment types viewable by farm member" ON public.equipment_types
  FOR SELECT TO authenticated USING (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Equipment types insertable by farm member" ON public.equipment_types
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Equipment types updatable by farm member" ON public.equipment_types
  FOR UPDATE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Equipment types deletable by farm member" ON public.equipment_types
  FOR DELETE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

-- ============================================================
-- LOCATIONS (farm_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Locations manageable by authenticated" ON public.locations;
DROP POLICY IF EXISTS "Locations viewable by authenticated" ON public.locations;

CREATE POLICY "Locations viewable by farm member" ON public.locations
  FOR SELECT TO authenticated USING (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Locations insertable by farm member" ON public.locations
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Locations updatable by farm member" ON public.locations
  FOR UPDATE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Locations deletable by farm member" ON public.locations
  FOR DELETE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

-- ============================================================
-- STORAGE_LOCATIONS (farm_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Storage locations manageable by authenticated" ON public.storage_locations;
DROP POLICY IF EXISTS "Storage locations viewable by authenticated" ON public.storage_locations;

CREATE POLICY "Storage locations viewable by farm member" ON public.storage_locations
  FOR SELECT TO authenticated USING (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Storage locations insertable by farm member" ON public.storage_locations
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Storage locations updatable by farm member" ON public.storage_locations
  FOR UPDATE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Storage locations deletable by farm member" ON public.storage_locations
  FOR DELETE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

-- ============================================================
-- MANUFACTURERS (farm_id scoped)
-- ============================================================
DROP POLICY IF EXISTS "Manufacturers manageable by authenticated" ON public.manufacturers;
DROP POLICY IF EXISTS "Manufacturers viewable by authenticated" ON public.manufacturers;

CREATE POLICY "Manufacturers viewable by farm member" ON public.manufacturers
  FOR SELECT TO authenticated USING (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Manufacturers insertable by farm member" ON public.manufacturers
  FOR INSERT TO authenticated WITH CHECK (farm_id IS NULL OR public.is_farm_member(farm_id));
CREATE POLICY "Manufacturers updatable by farm member" ON public.manufacturers
  FOR UPDATE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));
CREATE POLICY "Manufacturers deletable by farm member" ON public.manufacturers
  FOR DELETE TO authenticated USING (farm_id IS NOT NULL AND public.is_farm_member(farm_id));

-- ============================================================
-- EQUIPMENT_CATEGORIES (global reference data — read + insert only)
-- ============================================================
DROP POLICY IF EXISTS "Categories manageable by authenticated" ON public.equipment_categories;
DROP POLICY IF EXISTS "Categories viewable by authenticated" ON public.equipment_categories;

CREATE POLICY "Categories viewable by authenticated" ON public.equipment_categories
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Categories insertable by authenticated" ON public.equipment_categories
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- TASK_TYPES (global reference data — read + insert only)
-- ============================================================
DROP POLICY IF EXISTS "Task types manageable by authenticated" ON public.task_types;
DROP POLICY IF EXISTS "Task types viewable by authenticated" ON public.task_types;

CREATE POLICY "Task types viewable by authenticated" ON public.task_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Task types insertable by authenticated" ON public.task_types
  FOR INSERT TO authenticated WITH CHECK (true);
