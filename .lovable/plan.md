## Problème

Dans `src/components/time-tracking/dashboard/TimeTrackingTabs.tsx` (ligne 77), le bouton « Ouvrir les statistiques » navigue vers `/statistics?tab=time`, route qui n'existe pas → 404.

La route réelle déclarée dans `src/App.tsx` (ligne 134) est `/time-tracking/statistics`, et la page `TimeTrackingStatistics.tsx` lit déjà le query param `tab` avec les valeurs valides `overview | hours | time`.

## Correction

Un seul changement, une seule ligne :

`src/components/time-tracking/dashboard/TimeTrackingTabs.tsx`
```ts
onSeeReports={() => navigate('/time-tracking/statistics?tab=time')}
```

## Vérification des autres liens

- `WeekStatsCard.tsx` utilise déjà `/time-tracking/statistics?tab=hours` ✅
- `navConfig.ts` utilise déjà `/time-tracking/statistics` ✅
- Aucun autre lien vers `/statistics`, `/stats`, `/statistiques` n'existe.

## Validation

- Cliquer « Ouvrir les statistiques » depuis `/time-tracking` ouvre la page Statistiques avec l'onglet « Temps de travail » actif (la page lit déjà `tab=time`).
- Aucun changement de route, ni de RLS, ni de table.