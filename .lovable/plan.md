
## Objectif

Transformer `/equipment/:id` en fiche compacte premium correspondant à l'image validée : header dense, bandeau résumé 4 indicateurs, deux cartes côte à côte (À faire / Actions rapides), onglets, et Vue d'ensemble en 3 mini-cartes.

Aucune nouvelle route, aucune migration, aucune RLS modifiée. Réutilisation des hooks et dialogs existants.

## Layout cible

```text
← Retour aux équipements
┌──────────────────────────────────────────────────────────────┐
│ [photo 96] Carrousel · Système de traite                     │
│            GEA · 2018 · Système de traite                    │
│            ● Actif    🕒 0 h Compteur     [Modifier] [⋯]     │
└──────────────────────────────────────────────────────────────┘
┌─ Statut ─┬─ Maintenance ─┬─ Points ─┬─ Dernière activité ───┐
│ Actif    │ 1 en retard   │ 0 actif  │ Aujourd'hui            │
└──────────┴───────────────┴──────────┴────────────────────────┘
┌─ À faire sur cette machine ──┐ ┌─ Actions rapides ──────────┐
│ Pousse vache — graisser      │ │ [Compteur][Maint][Pt][QR]  │
│ Maintenance · Retard 1 j [Voir]│ │     Plus d'actions ▼       │
└──────────────────────────────┘ └────────────────────────────┘
[ Vue d'ensemble | Maintenance | Points | Historique | Pièces | QR ]
┌─ Maint. récentes ─┐ ┌─ Points récents ─┐ ┌─ Historique ─┐
└───────────────────┘ └──────────────────┘ └──────────────┘
```

Mobile : même ordre, 1 colonne, résumé 2x2, actions 2x2 (4 visibles) + Plus d'actions.

## Fichiers

### 1. `EquipmentHeader.tsx` (refonte)
- Photo 96px à gauche, fallback `Tractor`.
- Titre + sous-titre (type/catégorie). Chips outline `bg-muted/40` pour `manufacturer`, `year`, `type` (filtrer null/undefined/"Unknown").
- Statut traduit via `translateRawStatus` rendu en chip inline avec point coloré (`● Actif`).
- Compteur inline avec icône `Gauge` formaté via `formatCounter`.
- Bouton `Modifier` (outline sm) + `DropdownMenu` "⋯" contenant **Supprimer** (via `DeleteEquipmentDialog`).
- Header sur une seule ligne desktop ; sur mobile, actions reflowent sous le bloc texte.

### 2. Nouveau `SummaryStrip.tsx`
- Une `Card` rounded-2xl, `grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/60`.
- 4 cellules : Statut / Maintenance / Points / Dernière activité.
  - **Statut** : label traduit + sous-texte "Machine prête" / "À surveiller" / "Hors service".
  - **Maintenance** : `useMaintenanceTasks` → compte `overdue` ; affiche "X en retard" + sous-texte. Si 0 : "À jour".
  - **Points** : query `points` sur `farm_id` + `type='equipement'` + `entity_id = String(equipment.id)` (champ stable), fallback `entity_label ilike` si entity_id null. Statut ≠ resolved.
  - **Dernière activité** : `equipment.last_wear_update` ou max(`created_at`) entre tasks/points ; format relatif "Aujourd'hui / Il y a N j".
- Pas de noms de tâches ni listes — chiffres + libellés courts uniquement.

### 3. Nouveau `PriorityActionCard.tsx`
- Réutilise les mêmes données que SummaryStrip (passées en props ou refait les requêtes via les hooks centralisés).
- Sélectionne le **#1** selon : maintenance overdue > point critical > maintenance due bientôt > point important.
- Affiche : icône colorée (Wrench/Eye), titre, méta ("Maintenance · Retard 1 jour" / "Point · Important"), badge "En retard"/"À surveiller", bouton "Voir".
- "Voir" ouvre `MaintenanceTaskDetailDialog` (maintenance) ou `ObservationDetailsDialog` (point).
- Si N>1 : pied de carte "+ N autres éléments" + lien "Voir toutes les actions à faire" qui appelle `setActiveTab('maintenance' | 'points')` exposé par le parent.
- Fond légèrement teinté (`bg-red-50/60` si retard, `bg-amber-50/60` si à surveiller, sinon `bg-card`).
- État vide propre : "Rien à faire pour le moment ✓".

### 4. `QuickActions.tsx` (refonte)
- 4 actions visibles : **Compteur, Maintenance, Point, QR**.
- Bouton secondaire "Plus d'actions ▼" qui déplie (`Collapsible`) 3 actions : **Pièce, Carburant, Performance** (Intervention retiré car `/interventions` redirige vers `/points` — éviter doublon avec Point).
- Grille `grid-cols-2 sm:grid-cols-4`. Carburant ouvre l'onglet `fuel` ; Performance ouvre `performance`.
- Props : on enlève `onAddIntervention` ; ajoute `onShowFuel`, `onShowPerformance`.

### 5. `EquipmentTabs.tsx` (refonte)
- 6 onglets visibles : Vue d'ensemble, Maintenance, Points, Historique, Pièces, QR.
- Carburant / Performance / Temps : conservés et accessibles via le menu Plus d'actions (qui change `activeTab`) — on garde leur rendu interne mais pas de bouton d'onglet visible. Ajouter un sous-menu compact en haut de l'onglet Historique : liens "Carburant · Performance · Temps".
- Ajouter prop `activeTab` / `onTabChange` contrôlable depuis le parent (pour que QuickActions puisse forcer un onglet).
- Nouvel onglet "Points" rendu via `EquipmentPointsList` (composant léger réutilisant la même requête que SummaryStrip — peut être colocalisé dans `OverviewRecent`).
- Pas de scroll horizontal : `grid grid-cols-3 sm:grid-cols-6`.

### 6. Nouveau `OverviewRecent.tsx`
- Trois `Card` en `grid lg:grid-cols-3 gap-4` :
  - **Maintenances récentes** : 3 dernières non en retard (in-progress / scheduled), tri par date due ; lien "Toutes les maintenances" → `setActiveTab('maintenance')`.
  - **Points récents** : 2-3 derniers (resolved + active), tri `last_event_at` ; lien "Tous les points" → `setActiveTab('points')`.
  - **Historique récent** : agrégé (3 lignes max) maintenances complétées + points créés/résolus + mise à jour compteur ; lien "Voir tout" → `setActiveTab('history')`.
- Chaque ligne compacte : icône colorée + titre + heure relative.
- Anti-doublon : exclure l'élément déjà affiché dans PriorityActionCard.

### 7. `EquipmentDetailContent.tsx` (refonte du layout)
- Supprime du rendu principal : `StatusCard`, `MaintenancePriorityCard`, `EquipmentPointsCard`, `MachineJournalCard`, `LinkedPartsCard`, `FuelSummaryCard`, `QRCompactCard`, `CounterCard` (les fichiers restent — non importés).
- Nouvelle structure :
  ```
  <Header />
  <SummaryStrip />
  <div className="grid lg:grid-cols-2 gap-4">
    <PriorityActionCard onNavigateToTab={setActiveTab} />
    <QuickActions ... />
  </div>
  <EquipmentTabs activeTab={activeTab} onTabChange={setActiveTab}>
    overview → <OverviewRecent onNavigateToTab={setActiveTab} />
  </EquipmentTabs>
  ```
- État local `activeTab` remonté depuis EquipmentTabs vers le parent.
- Conserve les dialogs déjà branchés (`UpdateHoursDialog`, `NewPointDialog`, `AddMaintenanceDialog`, `AddPartDialog`, `EditEquipmentDialog`).

## Détails techniques

- **Statuts** : toujours via `translateRawStatus` (déjà en place) — jamais "operational"/"broken" bruts.
- **Compteur** : toujours via `formatCounter` ; jamais "0 jours".
- **Points join** : utiliser `entity_id = String(equipment.id)` en priorité (champ Point.entity_id existe) avec fallback sur `entity_label ilike %name%` pour compatibilité historique.
- **Routes** : `/interventions` est un alias `Navigate→/points` — on retire cette action pour éviter la confusion avec "Point". Aucune nouvelle route.
- **Menu ⋯** : `DropdownMenu` (shadcn déjà disponible).
- **Aucune modification** de `EquipmentOverview`, `EquipmentMaintenanceStatus`, `EquipmentParts`, `EquipmentFuelLogs`, `EquipmentPerformance`, `EquipmentTimeTracking`, `EquipmentQRCode`, `EquipmentMaintenanceHistory`, des hooks de données, des services, des types Supabase, des RLS.

## Validation

- Build TypeScript propre.
- 390 / 768 / 1366 / 1440 px sans scroll horizontal, sans texte coupé.
- Aucune route 404 (intervention retirée).
- Aucun `undefined`/`null`/`Unknown` rendu (chips filtrées, fallbacks systématiques).
- Toutes les anciennes sections restent accessibles via les onglets ou le menu Plus d'actions.
