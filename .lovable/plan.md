
# Plan — Dialog détail de tâche + assignation (avec précisions finales)

## Fichiers modifiés/créés

| Fichier | Action |
|---|---|
| `src/hooks/planning/usePlanningTasks.ts` | Ajouter mutation `updateTask` |
| `src/components/planning/TaskDetailDialog.tsx` | **Créer** — dialog détail complet |
| `src/components/planning/TaskCard.tsx` | Simplifier, ajouter `onClick`, badge priorité |
| `src/components/planning/TaskGroup.tsx` | Ajouter prop `onTaskClick` |
| `src/components/planning/DayView.tsx` | Ajouter prop `teamMembers`, intégrer dialog |
| `src/components/planning/WeekView.tsx` | Ajouter prop `teamMembers`, intégrer dialog |
| `src/components/planning/PlanningContent.tsx` | Passer `teamMembers` aux vues |

## Détails techniques

### 1. Hook — `usePlanningTasks.ts`
Ajouter mutation `updateTask` utilisant `planningService.updateTask(id, updates)`. Importer le type `PlanningTask`. Ajouter au return.

### 2. TaskDetailDialog (nouveau)
- **Reset propre** : `useEffect([task, open])` réinitialise `localAssignedTo` et `hasChanges=false` à chaque ouverture. Fermeture sans save = état ignoré.
- **Priorité affichée** : toujours `manual_priority ?? computed_priority`
- **Section Informations** : titre, catégorie (emoji+label), badges statut + priorité effective (critical=rouge, important=jaune, todo=gris), notes si présentes
- **Section Assignation et date** : Select membres d'équipe + "Non assigné", date affichée, bouton "Enregistrer" visible uniquement si `hasChanges === true`
- **Section Actions** :
  - Boutons statut contextuels : todo→Commencer, in_progress→Terminer, blocked→Débloquer. Jamais les deux (Bloqué/Débloquer) en même temps.
  - Reporter : 3 boutons — "Aujourd'hui", "Demain", "Choisir une date" (Popover+Calendar avec `pointer-events-auto`)
  - Supprimer : AlertDialog de confirmation avant exécution
  - Toutes les actions ferment le dialog après exécution

### 3. TaskCard — simplification
- Ajouter `onClick` prop, rendre cliquable (`cursor-pointer`)
- Supprimer tous les boutons d'action (déplacés dans le dialog)
- Garder : titre, catégorie, badge statut, badge priorité effective, personne assignée, notes (line-clamp-2)

### 4. TaskGroup
- Ajouter `onTaskClick` prop, passer aux TaskCard. Retirer les props d'action.

### 5-6. DayView et WeekView
- Recevoir `teamMembers` en prop
- État `selectedTask` pour ouvrir/fermer le dialog
- Rendre `TaskDetailDialog` avec mutations du hook

### 7. PlanningContent
- Passer `teamMembers` à `DayView` et `WeekView`
