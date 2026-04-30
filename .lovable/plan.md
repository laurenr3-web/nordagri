## Refonte Gestion des pièces — plan d'exécution

Préserve 100% de la logique métier (hooks, types, Supabase, dialogs intacts). Tri supporté confirmé dans `usePartsFilter`: `name-asc`, `name-desc`, `price-asc`, `price-desc`, `stock-asc`, `stock-desc`.

### 1. Header — actions uniques (`src/pages/Parts.tsx`)

- Bouton principal « Ajouter une pièce » : `className="bg-green-600 hover:bg-green-700 text-white"`, `size="sm"`, icône `Plus`.
- Bouton secondaire « Retirer une pièce » : `variant="outline"`, `size="sm"`, icône `MinusCircle`.
- Le reste de la page reste identique (dialogs Withdrawal / Add / Details inchangés).

### 2. Nouvelle barre compacte — `src/components/parts/toolbar/PartsCompactFilters.tsx` (créé)

Props strictement typées (sous-ensemble de ce que `PartsContainer` reçoit déjà) :

```ts
interface PartsCompactFiltersProps {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedCategory: string;
  setSelectedCategory: (v: string) => void;
  categories: string[];
  manufacturers: string[];
  filterManufacturers: string[];
  toggleManufacturerFilter: (m: string) => void;
  filterInStock: boolean;
  setFilterInStock: (v: boolean) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  view: PartsView;
  setView: (v: PartsView) => void;
  filterCount: number;
  clearFilters: () => void;
  filteredCount: number;
}
```

Desktop (≥ md) — une seule ligne dans une `Card` fine (`p-3`, `gap-2`, `flex items-center`):
- `Input` recherche avec icône loupe (flex-1, max-w-sm).
- `Select` Catégorie : « Toutes les catégories » + `categories`.
- `Select` Fabricant **single-select** : « Tous les fabricants » + `manufacturers`. Mappage vers le multi existant : sélection d'un fabricant → on appelle `toggleManufacturerFilter` pour synchroniser (désélectionne tous les autres puis active la valeur). « Tous » → on désélectionne tout. Implémentation : un effet local synchronise `filterManufacturers[]` à partir de la valeur du Select sans modifier le hook.
- `Select` Stock : « Tous » / « En stock uniquement » → bind sur `filterInStock`.
- `Select` Tri : 6 options (Nom A-Z, Nom Z-A, Prix ↑, Prix ↓, Stock ↑, Stock ↓), valeurs strictement issues du switch existant.
- `ToggleGroup` (single, type `single`) Grille / Liste (icônes `LayoutGrid` / `List`).
- À droite : `<span className="text-xs text-muted-foreground">{filteredCount} pièces</span>`.
- Bouton « Effacer » (ghost, X) visible si `filterCount > 0`.

Mobile (< md) — première ligne :
- Recherche flex-1.
- Bouton `Filtres` (outline) avec `Badge` `filterCount` si > 0 → toggle un `Collapsible`.
- `ToggleGroup` Grille/Liste compact.

`Collapsible` (mobile) contenu sous la ligne, en grille `grid-cols-2 gap-2` :
- Select Catégorie, Select Fabricant, Select Stock, Select Tri (chacun pleine largeur de sa cellule).
- Compteur « X pièces » et bouton « Effacer » sur une ligne en bas.

Aucun filtre prix exposé. Pas de Sheet.

### 3. `PartsContainer.tsx` — suppression du panneau latéral

- Retirer imports : `PartsFilters`, `Sheet`, `SheetContent`.
- Retirer state `isFilterSheetOpen`.
- Layout : remplacer la grille `md:grid-cols-[240px,1fr]` par un `<div className="space-y-3">` simple.
- Remplacer `<PartsToolbar>` par `<PartsCompactFilters>` (toolbar existante n'est plus utilisée par `PartsContainer`).
- Conserver `<Card><CardContent>` pour la liste, mais réduire padding : `p-0 sm:p-2 md:p-4`.
- `PartsFilters.tsx` n'est plus importé sur cette page (fichier conservé tel quel pour ne pas casser d'autres usages éventuels).

### 4. `PartsDesktopView.tsx` — table dense + DropdownMenu

- `Table` : `<TableRow className="h-12">`, cellules `py-2 text-sm`.
- Colonnes : Nom · Référence · Emplacement · Catégorie (`Badge variant="outline"`) · Stock · Prix (right) · Actions (right, w-12).
- Stock via helper local `getStockBadge(part)` :
  - 0 → `<Badge variant="destructive">Rupture</Badge>`
  - 1–5 → `<Badge className="bg-orange-500/15 text-orange-700 border-orange-500/30">Faible ({n})</Badge>`
  - ≥ 6 → `<Badge className="bg-green-500/15 text-green-700 border-green-500/30">{n}</Badge>`
- Actions : un `Button variant="ghost" size="icon"` avec `MoreHorizontal` ouvrant un `DropdownMenu` :
  - `Voir / Modifier` → `openPartDetails(part)`
  - `DropdownMenuSeparator`
  - `Retirer du stock` (className `text-destructive focus:text-destructive`) → `openWithdrawalDialog(part)`
- Suppression de `getStockStatusColor` côté UI (gardé dans `PartsContainer` pour ne pas casser la signature ; ignoré dans cette vue).
- Ligne entière : pas de cliquabilité globale (le clic détail reste sur le nom souligné au hover, comme actuellement).

### 5. `PartsMobileView.tsx` — cartes harmonisées

- `Card` `p-3 cursor-pointer` ; `onClick` carte → `openPartDetails(part)`.
- Header carte : `<h3 className="text-sm font-medium truncate">` + même `Badge` stock que desktop à droite.
- Ligne meta : `text-xs text-muted-foreground` → `{partNumber} · {location} · {price} €`.
- Bouton `MoreHorizontal` aligné à droite, `onClick={(e) => { e.stopPropagation(); ... }}`. `DropdownMenu` identique à desktop.
- Suppression des deux boutons pleine largeur en footer.

### 6. `PartsToolbar.tsx` — nettoyage

Bien que `PartsContainer` ne l'utilise plus, on respecte la consigne : retirer les boutons `Ajouter` et `Retirer` du composant lui-même pour éviter toute future duplication. On conserve uniquement :
- bouton « Supprimer (n) » (sélection multiple),
- recherche, filtres, tri, vue (existants).

Les props `onAddPart` et `onWithdrawPart` sont retirées de l'interface.

### Récap fichiers

```text
modifié : src/pages/Parts.tsx
modifié : src/components/parts/PartsContainer.tsx
modifié : src/components/parts/displays/PartsDesktopView.tsx
modifié : src/components/parts/displays/PartsMobileView.tsx
modifié : src/components/parts/toolbar/PartsToolbar.tsx
créé    : src/components/parts/toolbar/PartsCompactFilters.tsx
```

### Garanties

- Aucun nouveau package (DropdownMenu, Select, ToggleGroup, Collapsible, Badge déjà présents).
- Aucun `any` : props et helpers strictement typés via `Part` et `PartsView`.
- Aucun `setTimeout` / `setInterval`.
- Hooks (`useParts`, `usePartsFilter`, `usePartsWithdrawal`) inchangés.
- Types (`Part`, etc.) inchangés.
- Dialogs (`AddPartDialog`, `WithdrawalDialog`, `PartDetailsDialog`) inchangés.

Approuve ce plan et je passe à l'implémentation.