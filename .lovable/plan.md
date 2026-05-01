# Plan final : Système Punch In / Punch Out

Création complète du système, avec les 2 règles de sécurité intégrées dès la première version.

## 1. Base de données (migration)

**Table `public.work_shifts`**

| Colonne | Type | Notes |
|---|---|---|
| `id` | `uuid` PK `gen_random_uuid()` | |
| `user_id` | `uuid not null` | |
| `farm_id` | `uuid not null` | |
| `punch_in_at` | `timestamptz not null default now()` | |
| `punch_out_at` | `timestamptz` | null tant qu'actif |
| `status` | `text not null default 'active'` | `active` \| `completed` |
| `notes` | `text` | |
| `created_at` | `timestamptz default now()` | |

CHECK `status IN ('active','completed')`. Index :
- `(user_id, status)`, `(farm_id, punch_in_at desc)`
- **Unique partiel** : `CREATE UNIQUE INDEX uniq_active_work_shift_user ON public.work_shifts(user_id) WHERE status = 'active';`

RLS :
- SELECT `is_farm_member(farm_id)`
- INSERT/UPDATE `user_id = auth.uid() AND has_farm_role(farm_id, 'member')`
- DELETE `user_id = auth.uid() OR has_farm_role(farm_id, 'admin')`

**`time_sessions`** : ajouter `work_shift_id uuid` nullable, FK `ON DELETE SET NULL` + index. Pas de backfill.

## 2. Service & hooks

`src/services/work-shifts/types.ts` — types stricts (zéro `any`).

`src/services/work-shifts/workShiftService.ts` :
- `getActiveShift(userId)`
- `punchIn(userId, farmId)`
- **`ensureActiveShift(userId, farmId): Promise<{ shift; autoCreated: boolean }>`** — race-safe dès la 1ʳᵉ version :
  ```text
  1. existing = getActiveShift → si trouvé : { shift, autoCreated: false }
  2. INSERT punch_in
     succès : { shift, autoCreated: true }
  3. catch :
     code '23505' → reread = getActiveShift
                    si trouvé : { shift: reread, autoCreated: false }   ← jamais true
                    sinon : throw
     autre → throw
  ```
  Détection PG via guard typé sur `unknown` (pattern `isUniqueViolation` de `planningTimeService.ts`).
- `punchOut(shiftId)`
- `listShifts(userId, farmId, range)`
- **`getShiftReport(shiftId)`** — calcule `punchedSeconds` (de `punch_in_at` à `punch_out_at ?? now()`), `taskSeconds` (somme `time_sessions.work_shift_id`), puis :
  ```ts
  const offTaskSeconds = Math.max(0, punchedSeconds - taskSeconds);
  ```
  → garantit `offTaskSeconds ≥ 0` quoi qu'il arrive.

`src/hooks/work-shifts/useWorkShift.ts` :
- `useActiveWorkShift()` — `staleTime: 30s`
- `useWorkShiftMutations()` — invalide `['active-work-shift']`, `['planningTasks']`, `['active-time-entry']`, `['work-shifts-list']`

`src/hooks/work-shifts/useWorkShiftActions.ts` — encapsule auto-punch toast + AlertDialog punch out + ouverture report. Source unique pour Planning + Dashboard.

## 3. Auto Punch In au démarrage de tâche

`planningTimeService.startSessionForTask` :
1. Avant l'INSERT `time_sessions`, appeler `ensureActiveShift(userId, task.farm_id)`
2. Inclure `work_shift_id: shift.id` dans l'INSERT
3. Retourner `{ autoCreated }`

`usePlanningTaskTime.start.onSuccess` :
- Toast existant « Session démarrée » conservé
- **Si `autoCreated === true` uniquement** → toast info « Journée commencée automatiquement. »
- Invalider `['active-work-shift']`

`pauseSessionForTask` et `completeTaskWithSession` strictement inchangés.

## 4. Punch Out avec tâche active

Dans `useWorkShiftActions.handlePunchOut(shiftId)` :
1. Vérifier session active de l'utilisateur
2. Si présente → `AlertDialog` :
   - **Titre** : « Une tâche est encore en cours »
   - **Description** : « Voulez-vous l'arrêter avant de terminer la journée ? »
   - **Boutons** : `Annuler` / `Arrêter la tâche et punch out`
3. Si confirmé : `pauseSessionForTask(taskId)` puis `punchOut(shiftId)` — **jamais done**
4. Sinon : `punchOut` direct

## 5. UI

- `WorkShiftBar.tsx` — bandeau en haut de `PlanningContent`
- `WorkShiftCard.tsx` — carte Dashboard sous le message d'accueil. Inactif : « Journée de travail » + `Punch in`. Actif : « Journée en cours » + « Début 6:02 · 3h24 » + `Punch out` + icône `Voir journée`. Mobile pleine largeur, desktop `lg:max-w-md`.
- `WorkShiftReportDialog.tsx` — Total punché / Sur tâches / **Temps hors tâche** + sous-texte « Temps punché sans session de tâche active. » + liste tâches avec durées
- `WorkShiftsList.tsx` — onglet « Journées » dans `TimeTrackingTabs`. Lignes : date · punch in · punch out · durée · tâches · hors tâche. Clic → `WorkShiftReportDialog`.

## 6. Intégrations

- `src/pages/Dashboard.tsx` — `<WorkShiftCard />` dans `{hasFarm && user && (…)}`
- `src/components/planning/PlanningContent.tsx` — `<WorkShiftBar />` au-dessus du `ToggleGroup`
- `src/components/time-tracking/dashboard/TimeTrackingTabs.tsx` — onglet « Journées » entre Liste et Statistiques

## 7. Documentation

- `src/components/help/articles/work-shifts.md` (français terrain)
- Enregistrement dans `articles/index.ts` (cat. `planning`)
- Liens depuis `daily-planning.md` et `planning-task-time.md`

## 8. Mémoire

- `mem://features/work-shifts` (nouveau)
- Mise à jour `mem://index.md`

## Critères d'acceptation

| Critère | Couvert par |
|---|---|
| Tâche démarre sans punch manuel | `ensureActiveShift` |
| Race 23505 silencieuse, **pas de toast spam** | `autoCreated: false` sur relecture |
| Toast auto-punch quand action crée vraiment | `autoCreated: true` sur INSERT réussi |
| Punch out tâche active : message clair | AlertDialog titre/description/boutons exacts |
| Tâche jamais done au punch out | `pauseSessionForTask` uniquement |
| **Temps hors tâche ≥ 0 toujours** | `Math.max(0, punched - task)` |
| Journées retrouvables | Onglet `Journées` + `WorkShiftsList` |
| Rapports rétro-consultables | Clic → `WorkShiftReportDialog` |
| Aucune régression sessions existantes | `work_shift_id` nullable, pas de backfill |
| Mobile-first, pas de scroll horizontal | `h-11`, design Planning |

## Contraintes respectées

- Aucun nouveau package
- Aucun `any`
- React + TypeScript + Supabase
- Mobile-first
- Logique tâches inchangée hormis lien `work_shift_id`
- Pas de duplication : `useWorkShiftActions` partagé Planning + Dashboard
