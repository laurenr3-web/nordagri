# Séparer les tâches terminées — Section repliable

## Changements

### 1. `src/hooks/planning/usePlanningTasks.ts`
- Filtrer `status !== 'done'` avant de grouper en `critical`, `important`, `todo`
- Ajouter `doneTasks` (tableau des tâches terminées) dans le retour du hook

### 2. `src/components/planning/DayView.tsx`
- Récupérer `doneTasks` du hook
- Exclure les done du compteur `totalTasks`
- Ajouter en bas un `Collapsible` fermé par défaut : "✅ Terminées (N)"
- Afficher les `TaskCard` des tâches terminées dedans

### 3. `src/components/planning/WeekView.tsx`
- Filtrer les `done` hors des tâches par jour
- Ajouter un `Collapsible` global en bas avec toutes les tâches terminées de la semaine

### 4. `src/components/planning/TaskCard.tsx`
- Quand `status === 'done'`, masquer tous les boutons d'action (Commencer, Bloqué, Reporter)
- Garder uniquement le bouton Supprimer
- Simplifier l'affichage (garder titre, catégorie, badge "Terminé")