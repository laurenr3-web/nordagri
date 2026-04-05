
-- 1. Fonction trigger réutilisable pour updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Table planning_tasks
CREATE TABLE public.planning_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL DEFAULT 'autre'
    CHECK (category IN ('animaux','champs','alimentation','equipement','batiment','administration','autre')),
  status text NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','in_progress','done','blocked')),
  manual_priority text DEFAULT NULL
    CHECK (manual_priority IS NULL OR manual_priority IN ('critical','important','todo')),
  computed_priority text NOT NULL DEFAULT 'todo'
    CHECK (computed_priority IN ('critical','important','todo')),
  due_date date NOT NULL DEFAULT CURRENT_DATE,
  assigned_to uuid DEFAULT NULL REFERENCES public.team_members(id) ON DELETE SET NULL,
  notes text DEFAULT NULL,
  equipment_id integer DEFAULT NULL REFERENCES public.equipment(id) ON DELETE SET NULL,
  field_name text DEFAULT NULL,
  building_name text DEFAULT NULL,
  animal_group text DEFAULT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX idx_planning_tasks_farm_date ON public.planning_tasks (farm_id, due_date);
CREATE INDEX idx_planning_tasks_farm_status ON public.planning_tasks (farm_id, status);
CREATE INDEX idx_planning_tasks_assigned ON public.planning_tasks (assigned_to);

-- Trigger updated_at
CREATE TRIGGER set_planning_tasks_updated_at
  BEFORE UPDATE ON public.planning_tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.planning_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planning tasks viewable by farm member"
  ON public.planning_tasks FOR SELECT
  TO authenticated
  USING (is_farm_member(farm_id));

CREATE POLICY "Planning tasks insertable by farm member"
  ON public.planning_tasks FOR INSERT
  TO authenticated
  WITH CHECK (is_farm_member(farm_id) AND created_by = auth.uid());

CREATE POLICY "Planning tasks updatable by farm member"
  ON public.planning_tasks FOR UPDATE
  TO authenticated
  USING (is_farm_member(farm_id));

CREATE POLICY "Planning tasks deletable by farm member"
  ON public.planning_tasks FOR DELETE
  TO authenticated
  USING (is_farm_member(farm_id));

-- 3. Table planning_category_importance
CREATE TABLE public.planning_category_importance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  category text NOT NULL
    CHECK (category IN ('animaux','champs','alimentation','equipement','batiment','administration','autre')),
  importance text NOT NULL DEFAULT 'todo'
    CHECK (importance IN ('critical','important','todo')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(farm_id, category)
);

-- Trigger updated_at
CREATE TRIGGER set_planning_category_importance_updated_at
  BEFORE UPDATE ON public.planning_category_importance
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.planning_category_importance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Category importance viewable by farm member"
  ON public.planning_category_importance FOR SELECT
  TO authenticated
  USING (is_farm_member(farm_id));

CREATE POLICY "Category importance insertable by farm member"
  ON public.planning_category_importance FOR INSERT
  TO authenticated
  WITH CHECK (is_farm_member(farm_id));

CREATE POLICY "Category importance updatable by farm member"
  ON public.planning_category_importance FOR UPDATE
  TO authenticated
  USING (is_farm_member(farm_id));

CREATE POLICY "Category importance deletable by farm member"
  ON public.planning_category_importance FOR DELETE
  TO authenticated
  USING (is_farm_member(farm_id));

-- 4. Fonction d'initialisation serveur des valeurs par défaut
CREATE OR REPLACE FUNCTION public.ensure_default_category_importance(_farm_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO planning_category_importance (farm_id, category, importance)
  VALUES
    (_farm_id, 'animaux', 'critical'),
    (_farm_id, 'champs', 'important'),
    (_farm_id, 'alimentation', 'critical'),
    (_farm_id, 'equipement', 'important'),
    (_farm_id, 'batiment', 'todo'),
    (_farm_id, 'administration', 'todo'),
    (_farm_id, 'autre', 'todo')
  ON CONFLICT (farm_id, category) DO NOTHING;
END;
$$;
