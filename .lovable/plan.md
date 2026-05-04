## Objectif
Transformer chaque carte du widget "Statistiques cette semaine" du dashboard en raccourci cliquable vers la page correspondante.

## Mapping
- **Tâches terminées** → `/planning` (vue Terminées)
- **Maintenance ouverte** → `/maintenance`
- **En retard** → `/maintenance` (focus tâches en retard)
- **Heures suivies** → `/time-tracking/statistics`

## Changements

**`src/components/dashboard/v2/WeekStatsCard.tsx`**
1. Importer `useNavigate` de `react-router-dom`.
2. Ajouter `href` à chaque entrée du tableau `cells`.
3. Remplacer la `<div>` de chaque cellule par un `<button type="button">` avec :
   - mêmes classes visuelles + `hover:bg-accent/50 hover:border-primary/30 transition-colors cursor-pointer text-left w-full`
   - `onClick={() => navigate(href)}`
   - `aria-label` descriptif

Aucun changement SQL, aucun nouveau hook. Les routes ciblées existent déjà dans le projet.