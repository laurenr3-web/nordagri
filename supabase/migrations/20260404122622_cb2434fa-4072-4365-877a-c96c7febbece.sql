
ALTER TABLE public.maintenance_tasks
  ADD COLUMN completed_at_hours numeric NULL,
  ADD COLUMN completed_at_km numeric NULL;
