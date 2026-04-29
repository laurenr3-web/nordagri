# Modifier une tâche existante en planification

Aujourd'hui, `TaskDetailDialog` permet seulement de changer l'assigné, le statut, et la date de report. Tous les autres champs (titre, catégorie, notes, priorité, récurrence, équipement, champ, bâtiment, groupe d'animaux) ne sont pas éditables après création. On va ajouter un vrai mode édition.

## Approche

Réutiliser le formulaire existant `AddTaskForm` en le transformant en formulaire double-usage (création + édition), pour rester cohérent visuellement et éviter de dupliquer ~290 lignes de code.

## Changements

### 1. `src/components/planning/AddTaskForm.tsx`
- Ajouter une prop optionnelle `task?: PlanningTask` (la tâche à modifier).
- Quand `task` est fourni :
  - Pré-remplir tous les champs depuis la tâche via `useEffect` à l'ouverture.
  - Changer le titre du dialogue en "Modifier la tâche".
  - Changer le libellé du bouton en "Enregistrer les modifications".
- Le `onSubmit` reste identique côté signature ; le parent décide s'il appelle `addTask` ou `updateTask`.

### 2. `src/components/planning/TaskDetailDialog.tsx`
- Ajouter un bouton "Modifier" dans la section Actions (à côté de Commencer/Terminer/Bloqué).
- Au clic, fermer le dialogue de détail et ouvrir le formulaire d'édition (géré au niveau parent via une nouvelle prop `onEdit(task)`).
- Pour les tâches récurrentes virtuelles (avec `_occurrence_date`), l'édition s'applique à la tâche modèle (toutes les occurrences futures).

### 3. `src/components/planning/PlanningContent.tsx`
- Ajouter un état `editingTask: PlanningTask | null`.
- Brancher `onEdit` du `TaskDetailDialog` pour définir cet état.
- Réutiliser `AddTaskForm` en mode édition : `<AddTaskForm task={editingTask} onSubmit={...}>`.
- Dans le `onSubmit` d'édition, appeler `updateTask.mutate({ id, updates })` (déjà présent dans `usePlanningTasks`).

### 4. Aucun changement DB
La mutation `updateTask` et `planningService.updateTask` existent déjà et acceptent un `Partial<PlanningTask>`. Aucune migration requise.

## Détails techniques

- Pour la récurrence : si l'utilisateur change `recurrence_type` ou `recurrence_days`, on met à jour les colonnes correspondantes ; les complétions passées (`planning_task_completions`) restent intactes.
- Le `due_date` reste éditable, mais pour une récurrence virtuelle, modifier la date du modèle est volontaire (cohérent avec l'attente de l'utilisateur de modifier "la tâche").
- Pas d'ajout de bouton dans le swipe ; l'édition reste accessible depuis le détail (clic sur la carte).

## Résumé fichiers modifiés
- `src/components/planning/AddTaskForm.tsx` — support mode édition
- `src/components/planning/TaskDetailDialog.tsx` — bouton Modifier + prop `onEdit`
- `src/components/planning/PlanningContent.tsx` — orchestration édition
