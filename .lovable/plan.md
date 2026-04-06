# Plan — Dialog détail de tâche + assignation

## 1. `src/hooks/planning/usePlanningTasks.ts`
Add `updateTask` mutation after `deleteTask`:
```typescript
const updateTask = useMutation({
  mutationFn: ({ id, updates }: { id: string; updates: Partial<PlanningTask> }) =>
    planningService.updateTask(id, updates),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['planningTasks'] });
    toast.success('Tâche mise à jour');
  },
  onError: (e: any) => toast.error(e.message),
});
```
Add `updateTask` to the return object.

## 2. `src/components/planning/TaskDetailDialog.tsx` (NEW)
Props: `task: PlanningTask | null`, `open`, `onOpenChange`, `teamMembers: {id:string, name:string}[]`, `onStatusChange`, `onPostpone`, `onDelete`, `onUpdate`.

**Reset local state on open** — use `useEffect` watching `task` + `open` to reset `localAssignedTo` and `hasChanges` to false. On close without save, local state is discarded naturally.

**Section 1 — Informations:**
- Title (h3), category label+emoji, status badge, priority badge using `manual_priority ?? computed_priority` with colors (critical=red, important=yellow, todo=gray)
- Notes, equipment, field, building, animal group if present

**Section 2 — Assignation et date:**
- Select for team member (with "Non assigné" option), due_date display
- "Enregistrer" button visible only when `hasChanges === true`, calls `onUpdate(id, { assigned_to })` then closes

**Section 3 — Actions:**
- Status buttons (contextual):
  - `todo` → "Commencer" (→ in_progress)
  - `in_progress` → "Terminer" (→ done)
  - `blocked` → "Débloquer" (→ todo) — NO "Bloqué" button shown
  - NOT blocked → "Bloqué" button (→ blocked) — NO "Débloquer" shown
- Reporter: 3 buttons — "Aujourd'hui" (today), "Demain" (tomorrow), "Choisir une date" (Popover+Calendar with `pointer-events-auto`)
- Supprimer: AlertDialog confirmation before executing `onDelete`
- All actions close the dialog after execution

## 3. `src/components/planning/TaskCard.tsx`
- Add `onClick?: () => void` prop
- Make Card clickable: `cursor-pointer` + `onClick` on the Card
- Remove ALL action buttons (lines 71-111)
- Keep: title, category label, status badge, team_member_name, priority badge
- Add priority badge next to status badge:
```tsx
const priorityLabels = { critical: 'Critique', important: 'Important', todo: 'À faire' };
const priorityColors = { critical: 'bg-red-100 text-red-700', important: 'bg-yellow-100 text-yellow-700', todo: 'bg-muted text-muted-foreground' };
<Badge className={priorityColors[effectivePriority]}>{priorityLabels[effectivePriority]}</Badge>
```

## 4. `src/components/planning/TaskGroup.tsx`
- Add `onTaskClick?: (task: PlanningTask) => void` prop
- Pass `onClick={() => onTaskClick?.(task)}` to each TaskCard

## 5. `src/components/planning/DayView.tsx`
- Add props: `teamMembers: {id:string, name:string}[]`
- Add state: `selectedTask`, `dialogOpen`
- Get `updateTask` from `usePlanningTasks`
- Pass `onTaskClick` to TaskGroup and done TaskCards to set selectedTask + open dialog
- Render `TaskDetailDialog` with all handlers
- Handle update: `updateTask.mutate({ id, updates })`

## 6. `src/components/planning/WeekView.tsx`
- Add props: `teamMembers: {id:string, name:string}[]`
- Same integration as DayView: `selectedTask` state, dialog rendering
- Add `onClick` to each TaskCard in day sections and done section
- Get `updateTask` from hook

## 7. `src/components/planning/PlanningContent.tsx`
- Pass `teamMembers` prop to `DayView` and `WeekView`

## Files
| File | Action |
|---|---|
| `src/hooks/planning/usePlanningTasks.ts` | Add `updateTask` mutation |
| `src/components/planning/TaskDetailDialog.tsx` | **Create** |
| `src/components/planning/TaskCard.tsx` | Simplify, add onClick, add priority badge |
| `src/components/planning/TaskGroup.tsx` | Add onTaskClick prop |
| `src/components/planning/DayView.tsx` | Add teamMembers prop, dialog integration |
| `src/components/planning/WeekView.tsx` | Add teamMembers prop, dialog integration |
| `src/components/planning/PlanningContent.tsx` | Pass teamMembers to views |
