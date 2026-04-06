
-- Add recurrence columns to planning_tasks
ALTER TABLE public.planning_tasks
  ADD COLUMN IF NOT EXISTS is_recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurrence_type text,
  ADD COLUMN IF NOT EXISTS recurrence_days integer[];

-- Add check constraint for recurrence_type values
ALTER TABLE public.planning_tasks
  ADD CONSTRAINT planning_tasks_recurrence_type_check
  CHECK (recurrence_type IS NULL OR recurrence_type IN ('daily', 'weekly', 'custom'));

-- Add check constraint for recurrence_days values (0-6)
ALTER TABLE public.planning_tasks
  ADD CONSTRAINT planning_tasks_recurrence_days_check
  CHECK (recurrence_days IS NULL OR (
    array_length(recurrence_days, 1) > 0
    AND recurrence_days <@ ARRAY[0,1,2,3,4,5,6]
  ));

-- Table to track per-day completions of recurring tasks
CREATE TABLE public.planning_task_completions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid NOT NULL REFERENCES public.planning_tasks(id) ON DELETE CASCADE,
  completion_date date NOT NULL,
  completed_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(task_id, completion_date)
);

ALTER TABLE public.planning_task_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Completions viewable by farm member"
  ON public.planning_task_completions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.planning_tasks pt
    WHERE pt.id = planning_task_completions.task_id
      AND is_farm_member(pt.farm_id)
  ));

CREATE POLICY "Completions insertable by farm member"
  ON public.planning_task_completions FOR INSERT TO authenticated
  WITH CHECK (
    completed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.planning_tasks pt
      WHERE pt.id = planning_task_completions.task_id
        AND has_farm_role(pt.farm_id, 'member')
    )
  );

CREATE POLICY "Completions deletable by admin"
  ON public.planning_task_completions FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.planning_tasks pt
    WHERE pt.id = planning_task_completions.task_id
      AND has_farm_role(pt.farm_id, 'admin')
  ));
