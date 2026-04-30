
# Implémentation — Système de filtres « Points à surveiller »

Étape 1 (audit) validée. Voici l'implémentation prête à appliquer en mode build, conforme au brief avec les ajustements signalés (status `'watch'` réel, recherche sur `last_event_note` au lieu de `description` inexistant).

## Fichiers livrés

| # | Action | Chemin |
|---|---|---|
| 1 | Créer | `src/hooks/points/usePointsFilter.ts` |
| 2 | Créer | `src/components/points/PointsFilterBar.tsx` |
| 3 | Créer | `src/components/points/NoResultsState.tsx` |
| 4 | Modifier | `src/components/points/PointsPage.tsx` |

---

## Fichier 1 — `src/hooks/points/usePointsFilter.ts`

- Types exportés : `PointType`, `PointStatus`, `PointPriority` (importés depuis `@/types/Point`), `CheckFilter`, `PointsFilterState`.
- `DEFAULT_FILTERS`, `STORAGE_KEY = 'nordagri_points_filters_v1'`.
- `normalize(s)` : `toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')`.
- `useState` avec **initializer function** lisant `sessionStorage` (try/catch silencieux) → pas de flicker.
- `useEffect([filters])` qui sauvegarde en sessionStorage (try/catch silencieux).
- `updateFilter<K>` générique, `useCallback`.
- `resetFilters` : `useCallback` qui **préserve `statusTab`** (commentaire explicite).
- `filteredPoints` (`useMemo`) : applique dans l'ordre statusTab → type → priority → checkFilter (exclut `next_check_at` null si filtre actif) → search (haystack = `title + entity_label + last_event_note`).
- `counts` (`useMemo`) : `{ all, open, watch, resolved }` calculés sur points filtrés par type+priority+search **uniquement** (commentaire UX explicite : « `checkFilter` exclu pour éviter chiffres globaux instables »).
- `activeFiltersCount` (`useMemo`) : compte search/type/priority/checkFilter (pas statusTab).
- Bornes dates : `todayStart` (00:00:00.000), `todayEnd` (23:59:59.999), `weekEnd` = today + 7j à 23:59:59.999.

## Fichier 2 — `src/components/points/PointsFilterBar.tsx`

- Props : `{ filters, updateFilter, resetFilters, activeFiltersCount }`.
- Layout :
  - Ligne 1 : `Input` recherche pleine largeur avec icône `Search` absolute left.
  - Ligne 2 : `grid grid-cols-2 sm:flex sm:flex-wrap gap-2` contenant 3 `Select` (Type / Priorité / À vérifier) + bouton Reset (visible si `activeFiltersCount > 0`).
- Selects utilisent `TYPE_LABELS`, `PRIORITY_LABELS` de `pointHelpers.ts`. Première option « Tous… » (valeur `'all'`).
- Libellés `CheckFilter` : `all → "Toutes les dates"`, `today → "Aujourd'hui"`, `this_week → "Cette semaine"`, `overdue → "En retard"`.
- Sous la barre : `flex flex-wrap gap-1.5` de `Badge variant="secondary"` cliquables (X icon) si `activeFiltersCount > 0`. Recherche tronquée à 30 chars avec `…`.
- `aria-label` sur recherche et boutons X des badges.

## Fichier 3 — `src/components/points/NoResultsState.tsx`

- Props : `{ onReset: () => void }`.
- Centré `py-12`, icône `SearchX` 48px text-muted-foreground, titre h3, paragraphe explicatif, `<Button variant="outline" onClick={onReset}>Réinitialiser les filtres</Button>`.

## Fichier 4 — `src/components/points/PointsPage.tsx` (refactor)

Suppression intégrale de :
- `ORDER`, `EMPTY_MESSAGES`, état `collapsed`, fonction `toggle`, `grouped` (remplacé), boucle `ORDER.map(...)` avec sections collapsibles.

Ajouts :
- Imports : `Tabs, TabsList, TabsTrigger`, `usePointsFilter`, `PointsFilterBar`, `NoResultsState`, `STATUS_LABELS` déjà disponible.
- Branchement : `const { filters, updateFilter, resetFilters, filteredPoints, counts, activeFiltersCount } = usePointsFilter(points ?? []);`
- Rendu (après PageHeader, avant le FAB) :
  ```tsx
  <Tabs value={filters.statusTab} onValueChange={(v) => updateFilter('statusTab', v as PointStatus | 'all')}>
    <TabsList className="w-full grid grid-cols-4 h-auto">
      <TabsTrigger value="all">Tous ({counts.all})</TabsTrigger>
      <TabsTrigger value="open">{STATUS_LABELS.open} ({counts.open})</TabsTrigger>
      <TabsTrigger value="watch">{STATUS_LABELS.watch} ({counts.watch})</TabsTrigger>
      <TabsTrigger value="resolved">{STATUS_LABELS.resolved} ({counts.resolved})</TabsTrigger>
    </TabsList>
  </Tabs>
  <PointsFilterBar ... />
  ```
  Grid 4 colonnes (mobile constraint mémoire : pas de scroll horizontal). Texte `text-[11px] sm:text-sm` si nécessaire pour mobile 375px.
- Branche conditionnelle de contenu :
  1. `farmLoading || isLoading` → spinner existant.
  2. `!farmId` → message existant.
  3. `(points ?? []).length === 0` → `EmptyState` existant inchangé.
  4. `filteredPoints.length === 0` → `<NoResultsState onReset={resetFilters} />`.
  5. `filters.statusTab === 'all'` → `<GroupedView points={filteredPoints} />` (sous-composant local qui rend 3 sections statut non vides, simples titres `h3` + liste de `PointCard`, **sans collapsibles**).
  6. sinon → liste plate `<div className="space-y-1.5">` de `PointCard`.
- FAB et `NewPointDialog` / `PointDetailDialog` restent identiques.

## Garde-fous techniques

- Aucun `any` (génériques sur `updateFilter`, types stricts pour parse sessionStorage).
- Aucun `setTimeout`/`setInterval`.
- Aucun nouveau package.
- `useCreatePoint`, `usePoints`, `NewPointDialog`, `PointCard`, types `Point` : **inchangés**.
- 2 commentaires UX dans le hook (`counts` sans checkFilter, `resetFilters` préserve statusTab).
- Mobile : grid fixe 4 colonnes pour les onglets (pas de scroll horizontal — règle mémoire core), grid 2 colonnes pour les selects, badges `flex-wrap`.

## Mémoire à mettre à jour (après build)

Ajouter `mem://features/points-filtering` listé dans l'index : description du système (onglets statut, barre filtres, sessionStorage v1, suppression sections collapsibles).

---

À l'approbation, je passe en mode build et applique les 4 changements en une seule fois, suivi de la checklist cochée.
