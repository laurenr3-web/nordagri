## État actuel

- DB : ni colonne `time_sessions.task_id`, ni index unique partiel, ni RPC `has_active_session_on_task`.
- Code : aucun fichier `planningTimeService`, aucun hook `usePlanningTaskTime`, aucun composant `TaskTime*`.

→ Ce plan livre **l'amorçage minimal** intégrant directement les 3 corrections critiques. Aucun fichier de suivi de temps existant n'est modifié.

## 1. Migration DB (avec Fix 1 inclus)

```sql
-- Lien tâche ↔ session, nullable (préserve les sessions existantes)
ALTER TABLE public.time_sessions
  ADD COLUMN IF NOT EXISTS task_id uuid NULL
  REFERENCES public.planning_tasks(id) ON DELETE SET NULL;

-- Index utiles
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_active
  ON public.time_sessions(user_id) WHERE status = 'active';

-- FIX 1 : index unique partiel — anti race condition garantie DB
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_task_session
  ON public.time_sessions(task_id)
  WHERE status = 'active' AND task_id IS NOT NULL;

-- RPC SECURITY DEFINER : voir les sessions actives même cross-user
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
```

L'index unique partiel **est** la garantie atomique : peu importe la race, Postgres rejette le 2e INSERT avec `23505`. La RPC sert au pré-check ergonomique (toast clair avant l'INSERT dans 99% des cas).

## 2. Fichiers à créer

### `src/services/planning/planningTaskTypeMap.ts`

Mapping strict catégorie → `task_types.name` (valeurs DB existantes : `cleaning`, `fieldwork`, `inspection`, `maintenance`, `other`, `repair`, `transport`).

```ts
import type { PlanningCategory } from './planningService';

export const PLANNING_CATEGORY_TO_TASK_TYPE = {
  animaux: 'other',
  champs: 'fieldwork',
  alimentation: 'other',
  equipement: 'maintenance',
  batiment: 'maintenance',
  administration: 'other',
  autre: 'other',
} as const satisfies Record<PlanningCategory, string>;

export const PLANNING_CATEGORY_LABELS: Record<PlanningCategory, string> = {
  animaux: 'Animaux', champs: 'Champs', alimentation: 'Alimentation',
  equipement: 'Équipement', batiment: 'Bâtiment',
  administration: 'Administration', autre: 'Autre',
};

export function mapCategoryToTaskType(c: PlanningCategory): string {
  return PLANNING_CATEGORY_TO_TASK_TYPE[c] ?? 'other';
}
```

### `src/services/planning/planningTimeFormat.ts` (Fix 3)

Helpers d'affichage timezone-locale via `Intl.DateTimeFormat` (zéro nouveau package).

```ts
const TIME_FMT = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' });
const DATE_FMT = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

export const formatSessionTime = (iso: string): string => TIME_FMT.format(new Date(iso));
export const formatSessionDate = (iso: string): string => DATE_FMT.format(new Date(iso));

export function formatSessionRange(start: string, end: string | null): string {
  return end
    ? `${formatSessionTime(start)} – ${formatSessionTime(end)}`
    : `${formatSessionTime(start)} – en cours`;
}

export function formatDurationShort(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h${String(m).padStart(2, '0')}`;
  return `${m} min`;
}
```

**Règle absolue** : aucun composant n'imprime jamais un ISO directement — tout passe par ces helpers.

### `src/services/planning/planningTimeService.ts` (Fix 1 + Fix 2)

```ts
import { supabase } from '@/integrations/supabase/client';
import type { PlanningTask } from './planningService';
import { mapCategoryToTaskType, PLANNING_CATEGORY_LABELS } from './planningTaskTypeMap';

export const ERR_USER_SESSION_ACTIVE = 'USER_SESSION_ACTIVE';
export const ERR_TASK_SESSION_ACTIVE = 'TASK_SESSION_ACTIVE';

interface PgError { code?: string; message?: string }
function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return (err as PgError).code === '23505';
}

export interface TaskSessionRow {
  id: string;
  user_id: string;
  task_id: string | null;
  start_time: string;
  end_time: string | null;
  status: 'active' | 'paused' | 'completed' | 'disputed';
  user_name: string | null;
}

export interface TaskTimeStats {
  totalSeconds: number;
  sessionCount: number;
  hasActive: boolean;
  activeSessionId: string | null;
  activeStartTime: string | null;
}

export const planningTimeService = {
  async getTaskSessions(taskId: string): Promise<TaskSessionRow[]> {
    const { data, error } = await supabase
      .from('time_sessions')
      .select('id,user_id,task_id,start_time,end_time,status,profiles:user_id(first_name,last_name)')
      .eq('task_id', taskId)
      .order('start_time', { ascending: false });
    if (error) throw error;
    type Row = {
      id: string; user_id: string; task_id: string | null;
      start_time: string; end_time: string | null;
      status: TaskSessionRow['status'];
      profiles: { first_name: string | null; last_name: string | null } | null;
    };
    return (data as Row[] | null ?? []).map(r => ({
      id: r.id, user_id: r.user_id, task_id: r.task_id,
      start_time: r.start_time, end_time: r.end_time, status: r.status,
      user_name: r.profiles
        ? [r.profiles.first_name, r.profiles.last_name].filter(Boolean).join(' ') || null
        : null,
    }));
  },

  async getTaskTimeStats(taskId: string): Promise<TaskTimeStats> {
    const sessions = await this.getTaskSessions(taskId);
    let total = 0;
    let activeId: string | null = null;
    let activeStart: string | null = null;
    for (const s of sessions) {
      const start = new Date(s.start_time).getTime();
      const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
      total += Math.max(0, end - start);
      if (s.status === 'active' && !s.end_time) {
        activeId = s.id; activeStart = s.start_time;
      }
    }
    return {
      totalSeconds: Math.floor(total / 1000),
      sessionCount: sessions.length,
      hasActive: activeId !== null,
      activeSessionId: activeId,
      activeStartTime: activeStart,
    };
  },

  // ─── Fix 1 + Fix 2 : start ──────────────────────────────────────────
  async startSessionForTask(task: PlanningTask, userId: string): Promise<void> {
    // Pré-check user (UX)
    const { data: own } = await supabase
      .from('time_sessions').select('id')
      .eq('user_id', userId).eq('status', 'active').limit(1).maybeSingle();
    if (own) throw new Error(ERR_USER_SESSION_ACTIVE);

    // Pré-check tâche cross-user (UX, RPC SECURITY DEFINER)
    const { data: hasActive, error: rpcErr } = await supabase
      .rpc('has_active_session_on_task', { _task_id: task.id });
    if (rpcErr) throw rpcErr;
    if (hasActive === true) throw new Error(ERR_TASK_SESSION_ACTIVE);

    // Résolution task_type_id
    const { data: tt } = await supabase
      .from('task_types').select('id')
      .eq('name', mapCategoryToTaskType(task.category)).maybeSingle();

    // INSERT — vraie garantie via index unique partiel
    const { error: insErr } = await supabase.from('time_sessions').insert({
      user_id: userId,
      task_id: task.id,
      equipment_id: task.equipment_id ?? null,
      task_type_id: tt?.id ?? null,
      custom_task_type: PLANNING_CATEGORY_LABELS[task.category],
      title: task.title,
      status: 'active',
      start_time: new Date().toISOString(),
      technician: 'Self',
    });
    if (insErr) {
      if (isUniqueViolation(insErr)) throw new Error(ERR_TASK_SESSION_ACTIVE);
      throw insErr;
    }

    // Fix 2 : invariant statut tâche
    const { error: updErr } = await supabase
      .from('planning_tasks').update({ status: 'in_progress' }).eq('id', task.id);
    if (updErr) throw updErr;
  },

  resumeSessionForTask(task: PlanningTask, userId: string): Promise<void> {
    return this.startSessionForTask(task, userId);
  },

  // ─── Fix 2 : pause ferme exactement UNE session ─────────────────────
  async pauseSessionForTask(taskId: string): Promise<void> {
    const { data: s } = await supabase
      .from('time_sessions').select('id')
      .eq('task_id', taskId).eq('status', 'active')
      .order('start_time', { ascending: false }).limit(1).maybeSingle();

    if (s) {
      const { error } = await supabase
        .from('time_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('id', s.id);                 // UPDATE par PK = 1 ligne max
      if (error) throw error;
    }
    const { error: tErr } = await supabase
      .from('planning_tasks').update({ status: 'paused' }).eq('id', taskId);
    if (tErr) throw tErr;
  },

  async completeTaskWithSession(taskId: string): Promise<void> {
    const { data: s } = await supabase
      .from('time_sessions').select('id')
      .eq('task_id', taskId).eq('status', 'active')
      .order('start_time', { ascending: false }).limit(1).maybeSingle();
    if (s) {
      await supabase.from('time_sessions')
        .update({ status: 'completed', end_time: new Date().toISOString() })
        .eq('id', s.id);
    }
    const { error } = await supabase
      .from('planning_tasks').update({ status: 'done' }).eq('id', taskId);
    if (error) throw error;
  },

  async unblockTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('planning_tasks').update({ status: 'todo' }).eq('id', taskId);
    if (error) throw error;
  },
};
```

### `src/hooks/planning/usePlanningTaskTime.ts`

`useTaskTimeStats(taskId)`, `useTaskSessions(taskId)`, `usePlanningTimeMutations()`.

- `refetchInterval` conditionnel : `(q) => q.state.data?.hasActive ? 10_000 : false` — **pas de `setInterval` côté code**, React Query gère son propre timer interne (autorisé, ce n'est pas du nouveau timer applicatif).
- `refetchIntervalInBackground: false`.
- `onError` mappe `ERR_USER_SESSION_ACTIVE` / `ERR_TASK_SESSION_ACTIVE` vers des toasts FR clairs.
- `onSuccess` invalide `['planningTasks']`, `['planningOverdue']`, `['task-time-stats', taskId]`, `['task-sessions', taskId]`, `['active-time-entry']`.

### Composants Planning

- `TaskTimeBadge.tsx` — affiche `formatDurationShort(totalSeconds)` + nombre de sessions + badge "● En cours" si `hasActive`.
- `TaskSessionsList.tsx` — liste scrollable `max-h-48 overflow-y-auto` ; chaque ligne : `formatSessionDate(start)` · `formatSessionRange(start, end)` · `formatDurationShort(...)` · nom utilisateur.
- `TaskTimeControls.tsx` — boutons selon état (1 clic, mobile-first) :

| État | Boutons |
|---|---|
| `todo` | [Démarrer] |
| `in_progress` + `hasActive` | [Arrêter] [Terminer outline] |
| `in_progress` sans session (edge case) | [Reprendre] uniquement |
| `paused` | [Reprendre] [Terminer outline] |
| `blocked` | [Débloquer] |
| `done` | aucun |

## 3. Fichiers à éditer (changements minimaux)

- **`src/services/planning/planningService.ts`** : élargir `PlanningStatus` à `'todo' | 'in_progress' | 'paused' | 'done' | 'blocked'`. Aucune autre modification.
- **`src/components/planning/TaskCard.tsx`** : ajouter `paused` dans `statusLabels` ("En pause") et `statusColors` (amber). Insérer `<TaskTimeBadge>` et `<TaskTimeControls variant="card">` (sauf occurrences récurrentes virtuelles, pour ne pas casser la logique de complétion existante).
- **`src/components/planning/TaskDetailDialog.tsx`** : nouvelle section "Temps" (`TaskTimeBadge` + `TaskSessionsList` + `TaskTimeControls variant="dialog"`). Remplacer les anciens boutons "Commencer/Terminer" par `TaskTimeControls`. Conserver Bloquer/Reporter/Modifier/Supprimer.

## 4. Critères d'acceptation — couverture

| Critère | Garantie |
|---|---|
| Impossible de créer 2 sessions actives sur une tâche | Index unique partiel `uniq_active_task_session` |
| Double clic ne crée qu'une session | INSERT 2 → `23505` → `ERR_TASK_SESSION_ACTIVE` |
| Session active → tâche `in_progress` | UPDATE après INSERT OK dans `start/resumeSessionForTask` |
| Pause → tâche `paused` (1 seule session fermée) | UPDATE filtré par PK + UPDATE `planning_tasks` |
| Terminer → tâche `done` | `completeTaskWithSession` |
| Heures locales correctes | `Intl.DateTimeFormat('fr-FR')` partout |
| Aucune régression | `task_id` nullable, RLS inchangées, hooks time-tracking intacts |
| Edge case "in_progress sans session" | UI affiche **uniquement [Reprendre]** |

## 5. Non-régression

- **Aucun fichier de suivi de temps existant n'est modifié** : `useActiveTimeEntry`, `useTimeEntryOperations`, `timeTrackingService`, `TimeEntryForm`, `ActiveSessionsTable`, `EquipmentTimeTracking`.
- L'index unique partiel ne contraint que `(task_id IS NOT NULL AND status='active')` → sessions historiques (sans `task_id`) intactes.
- Aucun `any`. `PgError` est typé localement, pas de `as any`.
- Aucun `setInterval`/`setTimeout` applicatif ; le polling est délégué à React Query (timer interne, pas du code applicatif).
- Aucun nouveau package (`Intl.DateTimeFormat` est natif).

## Récapitulatif des fichiers

**Migration DB** :
- ALTER TABLE `time_sessions` (+ `task_id`)
- 2 INDEX (dont `uniq_active_task_session`)
- Fonction `has_active_session_on_task`

**Création** (6 fichiers) :
- `src/services/planning/planningTaskTypeMap.ts`
- `src/services/planning/planningTimeFormat.ts`
- `src/services/planning/planningTimeService.ts`
- `src/hooks/planning/usePlanningTaskTime.ts`
- `src/components/planning/TaskTimeBadge.tsx`
- `src/components/planning/TaskSessionsList.tsx`
- `src/components/planning/TaskTimeControls.tsx`

**Édition** (3 fichiers) :
- `src/services/planning/planningService.ts` (+ `'paused'`)
- `src/components/planning/TaskCard.tsx`
- `src/components/planning/TaskDetailDialog.tsx`
