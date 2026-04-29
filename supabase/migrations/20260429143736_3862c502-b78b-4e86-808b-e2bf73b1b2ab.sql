-- Function: if assigned_to matches a farm_members.id, remap to that member's user_id
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
    -- Check if assigned_to is actually a farm_members.id (legacy/incorrect value)
    SELECT fm.user_id INTO resolved_user_id
    FROM public.farm_members fm
    WHERE fm.id = NEW.assigned_to
    LIMIT 1;

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