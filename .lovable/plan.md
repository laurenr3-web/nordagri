

# Plan — Séparer les tâches terminées (application effective)

Le code n'a jamais été modifié malgré le plan approuvé. Voici les changements concrets à appliquer.

## 1. `src/hooks/planning/usePlanningTasks.ts`
- Filtrer les tâches actives (`status !== 'done'`) avant de les grouper en `critical`, `important`, `todo`
- Ajouter `doneTasks` au retour du hook

```typescript
const activeTasks = sortedTasks.filter(t => t.status !== 'done');
const doneTasks = sortedTasks.filter(t => t.status === 'done');

const groupedTasks = {
  critical: activeTasks.filter(...),
  important: activeTasks.filter(...),
  todo: activeTasks.filter(...),
};

return { tasks: sortedTasks, groupedTasks, doneTasks, ... };
```

## 2. `src/components/planning/DayView.tsx`
- Récupérer `doneTasks` du hook
- Exclure les done du compteur `totalTasks` (déjà le cas avec le nouveau groupedTasks)
- Ajouter en bas un `Collapsible` fermé par défaut : "✅ Terminées (N)"
- Afficher les `TaskCard` des tâches terminées dedans

## 3. `src/components/planning/WeekView.tsx`
- Filtrer les `done` hors des tâches affichées par jour
- Ajouter un `Collapsible` en bas avec les tâches terminées de la semaine

## 4. `src/components/planning/TaskCard.tsx`
- Quand `status === 'done'` : masquer les boutons Commencer, Bloqué, Reporter
- Garder uniquement le bouton Supprimer

## Fichiers modifiés
| Fichier | Action |
|---|---|
| `src/hooks/planning/usePlanningTasks.ts` | Filtrer done, retourner `doneTasks` |
| `src/components/planning/DayView.tsx` | Ajouter section collapsible terminées |
| `src/components/planning/WeekView.tsx` | Idem pour vue semaine |
| `src/components/planning/TaskCard.tsx` | Masquer actions inutiles si done |

