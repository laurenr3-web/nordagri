
ALTER TABLE public.maintenance_tasks
ADD COLUMN IF NOT EXISTS is_recurrent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS recurrence_interval numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS recurrence_unit text DEFAULT NULL;
