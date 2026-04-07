ALTER TABLE public.planning_tasks
  ADD COLUMN source_module text DEFAULT NULL,
  ADD COLUMN source_id text DEFAULT NULL;