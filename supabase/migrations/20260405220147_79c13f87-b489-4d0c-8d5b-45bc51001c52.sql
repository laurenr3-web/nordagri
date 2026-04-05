
DROP TRIGGER IF EXISTS sync_tasks_category_importance ON public.planning_category_importance;

CREATE OR REPLACE FUNCTION public.sync_tasks_on_category_importance_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.importance IS DISTINCT FROM OLD.importance THEN
    UPDATE planning_tasks
    SET computed_priority = NEW.importance
    WHERE farm_id = NEW.farm_id
      AND category = NEW.category;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sync_tasks_category_importance
  AFTER UPDATE ON public.planning_category_importance
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_tasks_on_category_importance_change();
