## Problème
La carte "Heures suivies" (3 h) du dashboard mène à `/time-tracking/statistics`, mais l'utilisateur ne retrouve pas cette donnée précise sur la page : la valeur correspond aux heures suivies sur les **7 derniers jours**, alors que la page affiche des sommes calendaires (semaine ISO / mois / trimestre) noyées parmi d'autres graphiques.

## Solution
Ajouter un **3e onglet « Heures des tâches »** à la page Statistiques qui montre exactement la donnée du widget : les sessions de temps des 7 derniers jours, avec détail par tâche et par employé.

### Modifications

**1. `src/pages/TimeTrackingStatistics.tsx`**
- Passer `TabsList` à `grid-cols-3`.
- Ajouter `<TabsTrigger value="hours">Heures des tâches</TabsTrigger>`.
- Ajouter `<TabsContent value="hours">` rendant le nouveau composant `TaskHoursTab`.
- Lire `?tab=hours` dans `useSearchParams` pour ouvrir directement cet onglet quand on arrive depuis la carte du dashboard.

**2. Mettre à jour le lien du dashboard**
- `src/components/dashboard/v2/WeekStatsCard.tsx` : `href: '/time-tracking/statistics?tab=hours'` pour la cellule « Heures suivies ».

**3. Nouveau composant `src/components/time-tracking/statistics/TaskHoursTab.tsx`**
Récupère via `supabase` les `time_sessions` du `farm_id` actif sur **7 derniers jours** (même fenêtre que le widget) :
```
select id, start_time, end_time, duration, task_id, user_id,
       task:planning_tasks!task_id(id, title, status),
       equipment_ref:equipment_id(id, name)
where start_time >= now()-7d
  and user_id in (membres de la ferme)
```

Affichage :
- **Bandeau résumé** (cards) : Total heures (7 j), Nb de sessions, Nb tâches distinctes, Nb employés actifs.
- **Liste groupée par tâche** : titre tâche (ou "Sans tâche" si `task_id` null), statut, durée totale, badge nombre de sessions, sous-liste des employés et leur durée. Cliquer une tâche ouvre `/planning` (futur lien direct possible).
- État de chargement (Skeleton) et état vide ("Aucune heure suivie sur les 7 derniers jours").

**4. Détails techniques**
- Nouveau hook `useTaskHoursLast7Days(farmId)` (React Query, `staleTime: 5*60_000`) dans `src/hooks/time-tracking/useTaskHoursLast7Days.ts`.
- Réutiliser `useFarmId()` pour scoper.
- Format heures : helper existant `formatHoursMinutes` ou `(duration h).toFixed(1)`.
- Pas de changement DB.

### Résultat
Quand l'utilisateur clique sur la carte « 3 h » du dashboard, il atterrit directement sur l'onglet « Heures des tâches » qui montre clairement d'où viennent ces 3 h (quelles tâches, quels employés, quand).