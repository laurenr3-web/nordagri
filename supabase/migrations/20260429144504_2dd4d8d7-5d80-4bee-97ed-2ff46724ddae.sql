-- Remove the obsolete foreign key that forced planning_tasks.assigned_to to reference farm_members.id.
ALTER TABLE public.planning_tasks
DROP CONSTRAINT IF EXISTS planning_tasks_assigned_to_fkey;

-- Remap existing planning task assignments from farm_members.id or legacy team_members.id to canonical user_id.
UPDATE public.planning_tasks pt
SET assigned_to = fm.user_id,
    updated_at = now()
FROM public.farm_members fm
WHERE pt.assigned_to = fm.id
  AND pt.assigned_to IS NOT NULL;

UPDATE public.planning_tasks pt
SET assigned_to = tm.user_id,
    updated_at = now()
FROM public.team_members tm
WHERE pt.assigned_to = tm.id
  AND tm.user_id IS NOT NULL
  AND pt.assigned_to IS NOT NULL;

-- Strengthen the normalizer so future writes using either legacy member table are corrected.
CREATE OR REPLACE FUNCTION public.normalize_planning_task_assigned_to()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  resolved_user_id uuid;
BEGIN
  IF NEW.assigned_to IS NOT NULL THEN
    SELECT fm.user_id INTO resolved_user_id
    FROM public.farm_members fm
    WHERE fm.id = NEW.assigned_to
    LIMIT 1;

    IF resolved_user_id IS NULL THEN
      SELECT tm.user_id INTO resolved_user_id
      FROM public.team_members tm
      WHERE tm.id = NEW.assigned_to
        AND tm.user_id IS NOT NULL
      LIMIT 1;
    END IF;

    IF resolved_user_id IS NOT NULL THEN
      NEW.assigned_to := resolved_user_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS planning_tasks_normalize_assigned_to ON public.planning_tasks;
CREATE TRIGGER planning_tasks_normalize_assigned_to
BEFORE INSERT OR UPDATE OF assigned_to ON public.planning_tasks
FOR EACH ROW
EXECUTE FUNCTION public.normalize_planning_task_assigned_to();