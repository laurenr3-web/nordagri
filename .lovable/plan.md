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
Add `updateTask` to the return object. Import `PlanningTask` type.

## 2. `src/components/planning/TaskDetailDialog.tsx` (NEW)
Props: `task: PlanningTask | null`, `open: boolean`, `onOpenChange`, `teamMembers: {id:string, name:string}[]`, `onStatusChange`, `onPostpone(id, newDate)`, `onDelete`, `onUpdate(id, updates)`.

Use `useEffect` on `[task, open]` to reset `localAssignedTo` from `task.assigned_to` and `hasChanges=false`. When dialog closes without save, stale local state is discarded on next open.

**Section Informations**: title, category emoji+label, status badge, priority badge using `manual_priority ?? computed_priority` (critical=red, important=yellow, todo=gray). Show notes, equipment, field, building, animal_group if present.

**Section Assignation et date**: Select with team members + "Non assigné" option. Due date displayed. Visible "Enregistrer" button, disabled until `hasChanges === true`. On save, call `onUpdate(task.id, { assigned_to })` and close.

**Section Actions**:
- `todo` → "Commencer" button
- `in_progress` → "Terminer" button (green)
- `blocked` → "Débloquer" button — do NOT show "Bloqué"
- NOT blocked → "Bloqué" button — do NOT show "Débloquer"
- Reporter: 3 buttons — "Aujourd'hui", "Demain", "Choisir une date" (Popover+Calendar with `pointer-events-auto`)
- Supprimer: AlertDialog confirmation → then `onDelete(task.id)` → close
- All actions close the dialog after execution

## 3. `src/components/planning/TaskCard.tsx`
- Add `onClick?: () => void` prop
- Make Card clickable: `cursor-pointer` + `onClick`
- Remove ALL action buttons (lines 71-111)
- Keep: title, category, status badge, team_member_name, notes (line-clamp-2)
- Add priority badge next to status badge (only for critical and important)

## 4. `src/components/planning/TaskGroup.tsx`
- Add `onTaskClick?: (task: PlanningTask) => void` prop
- Pass `onClick={() => onTaskClick?.(task)}` to each TaskCard
- Remove `onStatusChange`, `onPostpone`, `onDelete` props

## 5. `src/components/planning/DayView.tsx`
- Add prop: `teamMembers: {id:string, name:string}[]`
- Add state: `selectedTask`
- Get `updateTask` from hook
- Pass `onTaskClick={setSelectedTask}` to TaskGroup
- Render `TaskDetailDialog` with all handlers

## 6. `src/components/planning/WeekView.tsx`
- Add prop: `teamMembers: {id:string, name:string}[]`
- Same pattern: `selectedTask` state, dialog rendering

## 7. `src/components/planning/PlanningContent.tsx`
- Pass `teamMembers` to DayView and WeekView
