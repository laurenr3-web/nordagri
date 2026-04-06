
-- 1. Backfill farm_id on equipment
UPDATE equipment e
SET farm_id = f.id
FROM farms f
WHERE e.owner_id = f.owner_id AND e.farm_id IS NULL;

-- 2. Backfill farm_id on parts_inventory
UPDATE parts_inventory p
SET farm_id = f.id
FROM farms f
WHERE p.owner_id = f.owner_id AND p.farm_id IS NULL;

-- 3. Backfill farm_id on fuel_logs via equipment
UPDATE fuel_logs fl
SET farm_id = e.farm_id
FROM equipment e
WHERE fl.equipment_id = e.id AND fl.farm_id IS NULL AND e.farm_id IS NOT NULL;

-- 4. Add farm_id to maintenance_plans
ALTER TABLE public.maintenance_plans
ADD COLUMN IF NOT EXISTS farm_id uuid REFERENCES public.farms(id);

-- 5. Backfill maintenance_plans farm_id from equipment
UPDATE maintenance_plans mp
SET farm_id = e.farm_id
FROM equipment e
WHERE mp.equipment_id = e.id AND mp.farm_id IS NULL AND e.farm_id IS NOT NULL;

-- 6. Backfill maintenance_plans farm_id from owner
UPDATE maintenance_plans mp
SET farm_id = f.id
FROM farms f
WHERE mp.owner_id = f.owner_id AND mp.farm_id IS NULL;

-- 7. Update owns_equipment to support farm members
CREATE OR REPLACE FUNCTION public.owns_equipment(_equipment_id integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.equipment
    WHERE id = _equipment_id
      AND (
        owner_id = auth.uid()
        OR (farm_id IS NOT NULL AND public.is_farm_member(farm_id))
      )
  );
$function$;

-- 8. Drop old RLS policies on maintenance_plans
DROP POLICY IF EXISTS "Maintenance plans viewable by owner" ON public.maintenance_plans;
DROP POLICY IF EXISTS "Maintenance plans insertable by owner" ON public.maintenance_plans;
DROP POLICY IF EXISTS "Maintenance plans updatable by owner" ON public.maintenance_plans;
DROP POLICY IF EXISTS "Maintenance plans deletable by owner" ON public.maintenance_plans;

-- 9. Create new RLS policies for maintenance_plans with farm member support
CREATE POLICY "Maintenance plans viewable by owner or farm member"
ON public.maintenance_plans FOR SELECT
TO authenticated
USING (
  owner_id = auth.uid()
  OR (farm_id IS NOT NULL AND is_farm_member(farm_id))
);

CREATE POLICY "Maintenance plans insertable by owner"
ON public.maintenance_plans FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Maintenance plans updatable by owner or farm member"
ON public.maintenance_plans FOR UPDATE
TO authenticated
USING (
  owner_id = auth.uid()
  OR (farm_id IS NOT NULL AND is_farm_member(farm_id))
);

CREATE POLICY "Maintenance plans deletable by owner"
ON public.maintenance_plans FOR DELETE
TO authenticated
USING (owner_id = auth.uid());
