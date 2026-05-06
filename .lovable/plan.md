
# MVP Équipe & Horaire — Plan d'implémentation

`work_shifts`, `time_sessions`, `planning_tasks`, triggers Planning : INTACTS. On ajoute une nouvelle table `planned_shifts` pour les horaires planifiés.

## 1. Migration SQL — `public.planned_shifts`

```sql
create table if not exists public.planned_shifts (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  farm_member_id uuid not null references public.farm_members(id) on delete cascade,
  shift_date date not null,
  start_time time, end_time time,
  role text, notes text,
  status text not null default 'scheduled',
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint planned_shifts_status_check
    check (status in ('scheduled','confirmed','absent','completed')),
  constraint planned_shifts_time_order_check
    check (start_time is null or end_time is null or start_time < end_time)
);
create index if not exists planned_shifts_farm_date_idx on public.planned_shifts(farm_id, shift_date);
create index if not exists planned_shifts_member_date_idx on public.planned_shifts(farm_member_id, shift_date);
create index if not exists planned_shifts_farm_status_date_idx on public.planned_shifts(farm_id, status, shift_date);
alter table public.planned_shifts enable row level security;
```

Policies idempotentes (DO blocks) :
- SELECT : `is_farm_member(farm_id)`
- INSERT : `has_farm_role(farm_id,'member')` (sans contrainte `created_by = auth.uid()` — default `auth.uid()` suffit, conforme au pattern projet)
- UPDATE : `has_farm_role(farm_id,'member')`
- DELETE : `has_farm_role(farm_id,'admin')`

Trigger `BEFORE UPDATE` réutilisant `public.set_updated_at()` (existante).

Types Supabase : régénérés automatiquement après migration.

## 2. Types

`src/types/PlannedShift.ts` — `PlannedShiftStatus`, `PlannedShift`, `TeamTodayCardVM` (shiftId, farmMemberId, userId, displayName, startTime, endTime, roleLabel, shiftStatus, assignedCount, urgentCount).

## 3. Service

`src/services/planned-shifts/plannedShiftsService.ts` :
- `listByDay(farmId, date)` — order by `start_time`
- `listByWeek(farmId, weekStartDate)` — range `[weekStart, weekStart+6]`, order date+time
- `upsertShift(input)` — update filtré par id+farm_id ou insert
- `deleteShift(id, farmId)` — filtre id ET farm_id

## 4. Hooks `src/hooks/planned-shifts/`

- `usePlannedShiftsDay(farmId, date)` — `['planned-shifts', farmId, 'day', date]`
- `usePlannedShiftsWeek(farmId, weekStart)` — `['planned-shifts', farmId, 'week', weekStart]`
- `useUpsertPlannedShift()` / `useDeletePlannedShift()` — invalident `['planned-shifts', farmId]`
- Pas de Realtime V1.

## 5. Routing & navigation

- `src/App.tsx` : `import Team from '@/pages/Team'` (statique), route `/team` protégée près de `/planning`.
- `src/components/layout/navConfig.ts` : entrée "Équipe", icône `Users`, groupe `daily`, `mobileQuick: false`, `labelKey: navbar.team`, `mobileLabelKey: mobilemenu.team`.
- i18n : fr `Équipe`/`Équipe`, en `Team`/`Team`.

## 6. Page & composants

```text
src/pages/Team.tsx                       Tabs grid-cols-3: Aujourd'hui / Semaine / À ne pas oublier
src/components/team/TodayTab.tsx         Shifts du jour + tâches non assignées + CTA "+ Présence" / "Assigner"
src/components/team/WeekTab.tsx          7 jours empilés depuis weekStart, CTA "+ Présence" par jour
src/components/team/ToNotForgetTab.tsx   Maintenances dues + points ouverts + tâches importantes non assignées + bloquées + retard
src/components/team/ShiftCard.tsx        Nom, horaire, rôle, badge statut, badges nbTâches/nbCritiques
src/components/team/AddPresenceSheet.tsx membre/date/heures/rôle/statut/notes + validation start<end
src/components/team/QuickAssignSheet.tsx Liste tâches non assignées today → planningService.updateTask({ assigned_to: userId })
```

Comptage tâches : dérivation client via `usePlanningTasks` (filtre `due_date = today`, group by `assigned_to`), mapping `farm_member_id → user_id` via `useTeamMembers`.

## 7. Invalidations React Query

Vraies clés Planning vérifiées : `['planningTasks']`, `['planningOverdue']`, `['planningRecurring']`, `['planningCompletions']`, `['dashboard-v2']`. QuickAssign invalide ces clés exactes + `['planned-shifts', farmId]`. Aucun reload global.

## 8. Tests Vitest

- `plannedShiftsService` listByDay/listByWeek/upsert/delete (mock supabase)
- `usePlannedShiftsDay`, `useUpsertPlannedShift` (invalidations)
- `AddPresenceSheet` : rendu + erreur si `start_time >= end_time`
- `QuickAssignSheet` : appelle `planningService.updateTask({ assigned_to: userId })`, aucune autre mutation
- Smoke render `Team.tsx`

## 9. Mémoire

`mem://features/team-module` (route `/team`, `planned_shifts`, équipe = `farm_members`+`profiles`, work_shifts/time_sessions/planning_tasks intacts) + ligne dans `mem://index.md`.

## Checklist finale

work_shifts / time_sessions / planning_tasks / triggers Planning : intacts. Pas de `team_members` ni `employee_tasks`. RLS + 3 indexes + trigger `updated_at` sur `planned_shifts`. `/team` mobile-first, pas d'overflow, pas de reload, pas de lazy. TypeScript & build OK.
