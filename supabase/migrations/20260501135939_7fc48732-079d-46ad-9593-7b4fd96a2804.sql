-- Work shifts table
CREATE TABLE public.work_shifts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  farm_id uuid NOT NULL,
  punch_in_at timestamptz NOT NULL DEFAULT now(),
  punch_out_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT work_shifts_status_check CHECK (status IN ('active','completed'))
);

CREATE INDEX idx_work_shifts_user_status ON public.work_shifts(user_id, status);
CREATE INDEX idx_work_shifts_farm_punch_in ON public.work_shifts(farm_id, punch_in_at DESC);
CREATE UNIQUE INDEX uniq_active_work_shift_user
  ON public.work_shifts(user_id) WHERE status = 'active';

ALTER TABLE public.work_shifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work shifts viewable by farm member"
  ON public.work_shifts FOR SELECT TO authenticated
  USING (public.is_farm_member(farm_id));

CREATE POLICY "Work shifts insertable by self farm member"
  ON public.work_shifts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.has_farm_role(farm_id, 'member'));

CREATE POLICY "Work shifts updatable by self farm member"
  ON public.work_shifts FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND public.has_farm_role(farm_id, 'member'));

CREATE POLICY "Work shifts deletable by self or admin"
  ON public.work_shifts FOR DELETE TO authenticated
  USING (user_id = auth.uid() OR public.has_farm_role(farm_id, 'admin'));

-- Link time_sessions to work_shifts (nullable, no backfill)
ALTER TABLE public.time_sessions
  ADD COLUMN work_shift_id uuid REFERENCES public.work_shifts(id) ON DELETE SET NULL;

CREATE INDEX idx_time_sessions_work_shift_id ON public.time_sessions(work_shift_id);
