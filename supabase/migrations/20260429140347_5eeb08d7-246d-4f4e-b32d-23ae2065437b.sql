
ALTER TABLE public.planning_tasks
  ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS completed_by uuid;

-- Backfill existing done tasks
UPDATE public.planning_tasks
SET completed_at = updated_at
WHERE status = 'done' AND completed_at IS NULL;

-- Trigger function to auto-set completion metadata
CREATE OR REPLACE FUNCTION public.set_planning_task_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'done' AND (OLD.status IS DISTINCT FROM 'done') THEN
    NEW.completed_at := COALESCE(NEW.completed_at, now());
    NEW.completed_by := COALESCE(NEW.completed_by, auth.uid());
  ELSIF NEW.status <> 'done' AND OLD.status = 'done' THEN
    NEW.completed_at := NULL;
    NEW.completed_by := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_planning_task_completion ON public.planning_tasks;
CREATE TRIGGER trg_planning_task_completion
BEFORE UPDATE ON public.planning_tasks
FOR EACH ROW
EXECUTE FUNCTION public.set_planning_task_completion();
