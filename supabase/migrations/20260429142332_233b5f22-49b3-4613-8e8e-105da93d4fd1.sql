-- 1) Helper: pick the farm_id for the current user (owned farm preferred, then first membership)
CREATE OR REPLACE FUNCTION public.current_user_farm_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.farms WHERE owner_id = auth.uid() ORDER BY created_at ASC LIMIT 1
$$;

-- 2) Trigger: auto-fill farm_id on equipment insert when missing
CREATE OR REPLACE FUNCTION public.equipment_set_farm_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_farm uuid;
BEGIN
  IF NEW.farm_id IS NULL THEN
    -- Prefer owned farm of the inserting user
    SELECT id INTO resolved_farm
    FROM public.farms
    WHERE owner_id = COALESCE(NEW.owner_id, auth.uid())
    ORDER BY created_at ASC
    LIMIT 1;

    -- Fallback: first farm membership
    IF resolved_farm IS NULL THEN
      SELECT farm_id INTO resolved_farm
      FROM public.farm_members
      WHERE user_id = COALESCE(NEW.owner_id, auth.uid())
      ORDER BY created_at ASC
      LIMIT 1;
    END IF;

    IF resolved_farm IS NOT NULL THEN
      NEW.farm_id := resolved_farm;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_equipment_set_farm_id ON public.equipment;
CREATE TRIGGER trg_equipment_set_farm_id
BEFORE INSERT ON public.equipment
FOR EACH ROW
EXECUTE FUNCTION public.equipment_set_farm_id();

-- 3) Backfill existing equipment with NULL farm_id, using the owner's farm
UPDATE public.equipment e
SET farm_id = f.id
FROM public.farms f
WHERE e.farm_id IS NULL
  AND f.owner_id = e.owner_id;

-- 4) Backfill remaining (owner is not a farm owner): use first membership
UPDATE public.equipment e
SET farm_id = fm.farm_id
FROM public.farm_members fm
WHERE e.farm_id IS NULL
  AND fm.user_id = e.owner_id
  AND fm.farm_id IS NOT NULL;