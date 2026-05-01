-- Lien tâche planifiée ↔ session de temps
ALTER TABLE public.time_sessions
  ADD COLUMN IF NOT EXISTS task_id uuid NULL
  REFERENCES public.planning_tasks(id) ON DELETE SET NULL;

-- Index pour les lookups de sessions actives par utilisateur
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_active
  ON public.time_sessions(user_id) WHERE status = 'active';

-- FIX 1 : index unique partiel — anti race condition garantie DB
-- Garantit qu'au plus UNE session active peut exister par tâche
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_task_session
  ON public.time_sessions(task_id)
  WHERE status = 'active' AND task_id IS NOT NULL;

-- RPC SECURITY DEFINER : voir les sessions actives même cross-user
-- (la RLS de time_sessions limite par user_id, on a besoin d'un canal sûr
-- pour vérifier qu'aucun autre membre n'a une session active sur la tâche)
CREATE OR REPLACE FUNCTION public.has_active_session_on_task(_task_id uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.time_sessions
    WHERE task_id = _task_id AND status = 'active'
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_active_session_on_task(uuid) TO authenticated;