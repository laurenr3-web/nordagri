# Bouton "Commencer" dans Travail du jour

Ajouter un bouton compact **Commencer** dans `WorkTodayCard` pour les vraies tâches `planning_tasks`. Au clic : tâche → `in_progress` + session de temps créée, en réutilisant la mutation existante `usePlanningTimeMutations().start` (qui gère déjà auto Punch In, `time_sessions`, et toutes les invalidations). Aucune duplication de logique.

## Fichiers touchés

```text
src/hooks/planning/useStartTaskFromDashboard.ts   (NOUVEAU — wrapper + dialog state)
src/components/dashboard/v2/WorkTodayCard.tsx     (bouton + AlertDialog conflit)
src/pages/Dashboard.tsx                           (mapper farmId/equipmentId/dueDate)
```

## 1. Enrichir `WorkTodayItem` (WorkTodayCard.tsx)

```ts
export interface WorkTodayItem {
  id: string;
  title: string;
  category?: string | null;
  priority?: 'critical' | 'important' | 'todo' | null;
  assignedTo?: string | null;
  itemType?: 'task' | 'maintenance' | 'watch_point' | 'intervention' | 'part';
  status?: string | null;
  // Renseignés uniquement quand itemType === 'task'
  farmId?: string;
  equipmentId?: number | null;
  dueDate?: string;
}
```

## 2. Mapper dans `Dashboard.tsx`

Dans le `.map((t: any) => ({...}))` final, ajouter :
- `farmId: t.farm_id`
- `equipmentId: t.equipment_id ?? null`
- `dueDate: t.due_date`

(Les watch_points injectés en virtuel n'ont pas `farm_id`/`equipment_id` mais leur `itemType` est `'watch_point'` → bouton non affiché de toute façon.)

## 3. Hook `useStartTaskFromDashboard`

`src/hooks/planning/useStartTaskFromDashboard.ts` — wrapper minimal :

- Importe `usePlanningTimeMutations` et `ERR_USER_SESSION_ACTIVE`.
- Récupère `user` via `useAuthContext()`, `qc` via `useQueryClient()`.
- État local : `conflictItem: WorkTodayItem | null`.
- `startTask(item)` :
  1. Validation : `item.itemType === 'task'` + `item.farmId` présents, sinon return.
  2. Reconstruit un `PlanningTask` minimal (cast `as PlanningTask`) avec `id`, `farm_id`, `title`, `category`, `equipment_id`, `due_date` — `startSessionForTask` n'utilise que ces champs.
  3. `await start.mutateAsync({ task, userId: user.id })`.
  4. Catch : si `err.message === ERR_USER_SESSION_ACTIVE` → `setConflictItem(item)` (pas de toast d'erreur). Sinon, le `mapErrorToast` interne du hook source affiche déjà l'erreur.
  5. Succès : la mutation existante affiche déjà "Session démarrée" + invalidations. On override en ajoutant **après** un `toast.success("Tâche commencée · Temps démarré")` et on invalide en plus les clés dashboard.
- `confirmEndCurrentAndStart()` :
  1. `update time_sessions set status='completed', end_time=now() where user_id=auth.uid() and status='active'`.
  2. `await start.mutateAsync(...)` à nouveau.
  3. Toast "Nouvelle tâche commencée · Temps démarré". Ferme dialog.
- `confirmStartWithoutTime()` :
  1. `update planning_tasks set status='in_progress' where id=item.id`.
  2. Toast "Tâche commencée". Ferme dialog.
  3. Invalide clés dashboard + planning.
- `cancelConflict()` : `setConflictItem(null)`.
- Helper interne `invalidateDashboard()` :
  ```ts
  qc.invalidateQueries({ queryKey: ['planningTasks'] });
  qc.invalidateQueries({ queryKey: ['planningOverdue'] });
  qc.invalidateQueries({ queryKey: ['active-time-entry'] });
  qc.invalidateQueries({ queryKey: ['active-work-shift'] });
  qc.invalidateQueries({ queryKey: ['dashboard-v2', 'activeTeam'] });
  qc.invalidateQueries({ queryKey: ['dashboard-v2', 'signals'] });
  qc.invalidateQueries({ queryKey: ['farm-team-status'] });
  ```
- Retourne `{ startTask, conflictItem, confirmEndCurrentAndStart, confirmStartWithoutTime, cancelConflict, isLoading: start.isPending }`.

## 4. UI dans `WorkTodayCard.tsx`

- Importer le hook + `Play` de lucide + `AlertDialog*` de shadcn.
- Au début du composant : `const tasks = useStartTaskFromDashboard();`.
- Dans le rendu de chaque ligne, calculer :
  ```ts
  const startable = item.itemType === 'task'
    && [undefined, null, 'todo', 'pending', 'paused'].includes(item.status as any);
  ```
- Si `startable` : remplacer le `<span className="…badgeTone">{ph.badge}</span>` par :
  ```tsx
  <Button
    size="sm" variant="outline"
    className="h-7 px-2 text-xs shrink-0 whitespace-nowrap gap-1"
    disabled={tasks.isLoading}
    onClick={(e) => { e.stopPropagation(); tasks.startTask(item); }}
  >
    <Play className="h-3 w-3" />
    Commencer
  </Button>
  ```
- Sinon : badge actuel inchangé (en particulier "En cours" pour `in_progress` géré par `phase()`).
- À la fin du JSX (hors de la map), ajouter un seul `<AlertDialog open={!!tasks.conflictItem} onOpenChange={(o) => !o && tasks.cancelConflict()}>` avec :
  - Titre : "Session déjà active"
  - Description : "Tu as déjà une session en cours. Que veux-tu faire ?"
  - 3 actions (boutons) : "Terminer l'actuelle et commencer", "Commencer sans démarrer le temps", "Annuler".

## 5. Garde-fous

- ✅ Aucune nouvelle route, aucune table, aucune RLS modifiée.
- ✅ Aucun fichier des modules Planification ou Suivi du temps modifié — seulement consommé.
- ✅ Bouton **uniquement** quand `itemType === 'task'` → exclut watch_points / maintenance / interventions / parts.
- ✅ Pas de double session : la mutation source vérifie déjà ; le dialog couvre explicitement le conflit.
- ✅ Layout mobile préservé (`shrink-0`, `whitespace-nowrap`, le titre garde son `truncate`).
