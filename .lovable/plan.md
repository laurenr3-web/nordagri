## Objectif

Clarifier la séparation entre **Suivi du temps** (opérationnel) et **Statistiques** (analyse) en retirant les rapports/graphiques avancés de `/time-tracking` et en pointant vers la page Statistiques existante.

## État actuel constaté

- `/time-tracking` a 4 onglets : **Vue du jour, Équipe, Historique, Rapports** (`TimeTrackingTabs.tsx`).
- L'onglet **Rapports** affiche `TimeTrackingRapport` (graphiques avancés : par membre, équipement, type de travail).
- Dans la **Vue du jour**, une carte « Rapports disponibles » mène vers cet onglet Rapports interne.
- La page **Statistiques** (`/statistics`, `TimeTrackingStatistics.tsx`) existe déjà avec 3 onglets : Vue d'ensemble, Heures des tâches, **Temps de travail** — ce dernier rend déjà `TimeTrackingStatisticsPage` (graphiques par équipement, employé, type de tâche, etc.).

Conclusion : aucun graphique à déplacer, tout existe déjà côté Statistiques. Il suffit de **retirer** les rapports de Suivi du temps et de **rediriger** vers `/statistics?tab=time`.

## Modifications

### 1. `src/components/time-tracking/dashboard/TimeTrackingTabs.tsx`
- Retirer l'entrée `{ value: 'reports', ... }` du tableau `TABS`.
- Retirer le `<TabsContent value="reports">` qui rend `TimeTrackingRapport`.
- Passer la `TabsList` de `grid-cols-4` à `grid-cols-3`.
- Retirer l'import `TimeTrackingRapport` et l'icône `BarChart3` si non utilisés ailleurs.
- Le prop `onSeeReports` reste mais pointera vers `/statistics?tab=time` (navigation externe) au lieu de changer d'onglet interne.

### 2. `src/components/time-tracking/dashboard/TimeTrackingPage.tsx`
- Mettre à jour la liste des valeurs valides de `tab` : remplacer `'list' || 'statistics' || 'rapport'` par `'reports'` aussi (fallback vers `'day'`) afin que toute URL `?tab=reports` retombe sur Vue du jour sans casser.

### 3. `src/components/time-tracking/dashboard/TimeTrackingTabs.tsx` — handler `onSeeReports`
- Au lieu de `() => onTabChange('reports')`, naviguer vers `/statistics?tab=time` via `useNavigate` de `react-router-dom`. Passer ce handler au `DayViewTab`.

### 4. `src/components/time-tracking/dashboard/DayViewTab.tsx`
- Garder la carte « Rapports disponibles » mais la renommer en **« Voir les statistiques de temps »** avec un libellé descriptif court (« Analyse détaillée par membre, équipement et type de travail. ») et le bouton « Voir les statistiques → ».
- Laisser le rendu actuel (Card discrète sous Sessions récentes côté mobile, dans la colonne droite côté desktop) — c'est déjà un bloc discret conforme à la demande.
- `onSeeReports` exécute la redirection vers `/statistics?tab=time`.

### 5. Aucun changement
- `TimeTrackingRapport` et le dossier `rapport/` restent en place (réutilisés implicitement par `TimeTrackingStatisticsPage` via ses propres imports — vérifier qu'aucune autre route ne dépend de l'onglet retiré).
- Aucune modification base de données, RLS, punch in/out, historique, ou hooks.
- Pas de duplication : les graphiques ne vivent plus que dans `/statistics`.

## Vérifications avant build

- `rg "tab=reports|'reports'"` dans `src/` pour s'assurer qu'aucun lien externe ne pointe vers l'onglet supprimé.
- Confirmer que `TimeTrackingRapport` n'est plus importé que par la page Statistiques (sinon laisser l'import là où nécessaire).

## Résultat

- `/time-tracking` : 3 onglets (Vue du jour, Équipe, Historique) + un bloc discret « Voir les statistiques de temps → » menant vers `/statistics?tab=time`.
- `/statistics` : inchangé, contient déjà toute l'analyse avancée.
- Punch in/out, historique, sessions actives : intacts.