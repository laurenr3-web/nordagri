## Objectif

Refondre la page `Statistiques` (`/time-tracking/statistics`) pour qu'elle soit lisible en moins de 5 secondes : KPIs orientés terrain (Tâches, Points à surveiller, Réactivité), aucun graphique. La page actuelle (graphes temps/équipement) est conservée mais déplacée dans un onglet « Temps de travail » pour ne pas perdre la fonctionnalité.

## Structure de la page

```
PageHeader: "Statistiques"
[ Filtre période : Aujourd'hui | Semaine (défaut) | Mois ]

Onglets :
  [ Vue d'ensemble (nouveau, par défaut) ]   [ Temps de travail (existant) ]

== Vue d'ensemble ==
  Section TÂCHES
    [Card] Complétées   [Card] En retard   [Card] En cours
    Liste « Plus actif : <prénom> » + top employés (nom + nb tâches complétées)

  Section POINTS À SURVEILLER
    [Card] Points ouverts   [Card] Points réglés (période)   [Card] Points oubliés (>3j)
    [Card large] Temps moyen de résolution : X jours

  Section RÉACTIVITÉ
    [Card] Temps moyen avant 1ʳᵉ action sur un point : X h
    [Card] Temps moyen pour compléter une tâche : X h
```

## Données / calculs (côté client, pas de migration)

Période sélectionnée → `[from, to]` :
- Aujourd'hui : `from = today 00:00`, `to = today 23:59`
- Semaine : 7 derniers jours glissants (`today-6 → today`)
- Mois : 30 derniers jours glissants

Source unique par section, sans nouveau hook lourd : on lit ce qui existe déjà.

### Tâches — table `planning_tasks`
- Complétées : `status = 'done' AND completed_at BETWEEN from AND to`
- En retard : `status != 'done' AND due_date < today`
- En cours : `status IN ('todo','in_progress') AND due_date BETWEEN from AND to` (tâches actives sur la période)
- Top employés : group by `completed_by` sur les complétées de la période → join avec `useTeamMembers()` pour récupérer le prénom. « Plus actif » = max count. Pas de classement négatif.

### Points — tables `points` + `point_events`
- Ouverts : `status != 'resolved'` (compteur global, indépendant de la période — c'est une photo de l'état actuel)
- Réglés sur la période : `resolved_at BETWEEN from AND to`
- Oubliés (>3 j) : `status != 'resolved' AND last_event_at < today - 3 days`
- Temps moyen de résolution : pour les points dont `resolved_at` tombe dans la période, moyenne de `resolved_at - created_at` en jours.

### Réactivité
- Temps avant 1ʳᵉ action sur un point : pour les points créés dans la période, requête `point_events` (premier event de type `action` ou `correction` après `created_at`) → moyenne `firstEvent.created_at - point.created_at` en heures.
- Temps moyen pour compléter une tâche : pour les tâches `done` dans la période, moyenne `completed_at - created_at` en heures.

## Fichiers à créer / modifier

- **Nouveau** `src/hooks/statistics/useOperationalStats.ts`
  - Signature : `useOperationalStats(farmId, period: 'today'|'week'|'month')`
  - 3 sous-requêtes parallèles via React Query :
    1. `planning_tasks` (filtres farm + plage temporelle pour completed_at, plus toutes les non-done pour overdue/in-progress)
    2. `points` (toutes les lignes du farm — petites tables)
    3. `point_events` (events de la période liés aux points du farm)
  - Calcule en mémoire les KPIs ci-dessus + agrège « top employés ».
  - Retour : `{ tasks: {done, overdue, inProgress, perEmployee[], topEmployee}, points: {open, resolved, forgotten, avgResolutionDays}, reactivity: {avgFirstActionHours, avgCompletionHours}, isLoading }`

- **Nouveau** `src/components/statistics/OperationalOverview.tsx`
  - Filtre période (3 boutons toggle)
  - 3 sections de cards simples (composants `Card` shadcn déjà dispo, gros chiffre + label court)
  - Composant interne `StatCard` réutilisable (titre, valeur, sous-titre optionnel, couleur d'accent)
  - Liste « Top employés » : 5 lignes max (`Avatar` + nom + nb), badge « Plus actif » sur le 1ᵉʳ.

- **Modifié** `src/pages/TimeTrackingStatistics.tsx`
  - Renommer le titre en « Statistiques »
  - Ajouter `Tabs` : `Vue d'ensemble` (par défaut) + `Temps de travail`
  - L'ancien contenu (`TimeTrackingStatisticsPage`) est déplacé dans le 2ᵉ onglet, **inchangé**.

- **Modifié** `src/components/layout/navConfig.ts`
  - L'entrée « Statistiques » existe déjà. Aucune modif de route.

## Hors périmètre (à ne pas faire)

- Aucune migration DB, aucun changement de schéma ni RLS.
- Aucun graphique ajouté.
- Aucune suppression : la page « Temps de travail » avec ses graphes existants est conservée comme onglet secondaire.
- Pas de classement négatif des employés.

## Considérations

- **Privacy / RLS** : tout est déjà filtré par farm via les RLS existantes. `useTeamMembers()` (déjà utilisé partout) fournit les noms des employés sans toucher `auth.users`.
- **Performance** : trois requêtes simples scoppées par farm + plage. Données agrégées en mémoire (volumes faibles). `staleTime` 5 min selon la convention projet.
- **Mobile-first** : grilles `grid-cols-1 sm:grid-cols-3` pour les cards ; pas de scroll horizontal. Filtre période en `grid-cols-3` plein largeur sur mobile.
- **Vide** : si une stat n'a pas assez de données (ex. 0 tâche complétée), afficher « — » plutôt qu'un 0 trompeur pour les moyennes.

## Résultat attendu

Quand l'utilisateur ouvre `/time-tracking/statistics`, il voit immédiatement (en 5 secondes) :
- Combien de tâches avancent / sont en retard, qui pousse l'équipe.
- Si des points traînent (oubliés > 3 j) et la vitesse moyenne de résolution.
- À quelle vitesse l'équipe réagit aux problèmes et termine les tâches.

Les graphes existants restent disponibles dans un second onglet pour l'analyse fine.
