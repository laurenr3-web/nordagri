# Remplacer la statistique "Interventions" par "Points à surveiller"

## Contexte

Sur la carte **Statistiques** du dashboard (`StatsWidget`), la 4ᵉ tuile s'appelle encore **"Interventions"** et utilise `data.fieldInterventions` (basé sur `urgentInterventions`). Or les interventions terrain ont été remplacées par le module **Points à surveiller**. Il faut donc :

- Renommer la tuile en **"Points à surveiller"**
- Afficher le **nombre de points non terminés** (statuts `open` + `watch`, en excluant `resolved`)
- Cliquer sur la tuile redirige vers `/points` (au lieu de `/interventions`)

## Audit

- **`src/components/dashboard/widgets/StatsWidget.tsx`** (ligne 47-51) : tuile "Interventions" → `data?.fieldInterventions`, nav `/interventions`, icône `MapPin`.
- **`src/hooks/dashboard/useWidgetData.ts`** (ligne 91) : `fieldInterventions: dashboardData.urgentInterventions?.length || 0` — c'est cette valeur qui alimente la tuile.
- **`src/hooks/points/usePoints.ts`** : retourne tous les points d'une ferme (typés `PointWithLastEvent[]` avec `status` ∈ `'open' | 'watch' | 'resolved'`).
- **`src/hooks/useFarmId.ts`** : déjà disponible (utilisé partout).

Les `urgentInterventions` ne sont plus pertinents pour cette tuile, mais restent utilisés par d'autres widgets (`interventions` widget). On ne les supprime pas — on remplace juste la valeur affichée dans la tuile stats.

## Implémentation

### 1. `src/hooks/dashboard/useWidgetData.ts`

- Importer `usePoints` depuis `@/hooks/points/usePoints`.
- Appeler `usePoints(farmId)` (le hook a déjà `enabled: !!farmId`, donc pas de coût quand pas de ferme).
- Calculer `activePointsCount = (points ?? []).filter(p => p.status !== 'resolved').length`.
- Dans le `case 'stats'`, remplacer :
  ```ts
  fieldInterventions: dashboardData.urgentInterventions?.length || 0
  ```
  par :
  ```ts
  pointsToWatch: activePointsCount
  ```
  (on garde `fieldInterventions` aussi pour ne rien casser ailleurs si lu — ou on le retire si on confirme qu'aucun autre consommateur ne le lit. Vérification : seul `StatsWidget` lit `data.fieldInterventions`. → on peut le retirer proprement.)

### 2. `src/components/dashboard/widgets/StatsWidget.tsx`

Remplacer la 4ᵉ tuile :

```ts
{
  title: 'Points à surveiller',
  value: data?.pointsToWatch || 0,
  icon: Eye, // ou AlertCircle — voir choix ci-dessous
  onClick: () => navigate('/points')
}
```

- **Icône** : `Eye` (lucide-react) colle bien à "à surveiller". Alternative : `AlertCircle`. Je propose **`Eye`** pour rester cohérent avec la sémantique « points à surveiller / observer ».
- Garder le label sur 2 lignes (déjà géré par le layout `text-xs leading-tight`).

### 3. Aucun changement SQL / RLS / type DB

Tout est en lecture côté client.

## Checklist d'acceptation

- [ ] La tuile affiche "Points à surveiller" au lieu de "Interventions"
- [ ] La valeur = nombre de points avec `status` ∈ `{open, watch}` (les `resolved` exclus)
- [ ] Clic redirige vers `/points`
- [ ] Icône cohérente (Eye)
- [ ] Aucune régression TypeScript / runtime
- [ ] Loading state inchangé (skeleton)
