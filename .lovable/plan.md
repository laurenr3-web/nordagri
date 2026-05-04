# Refonte fiche équipement — implémentation

## Approche

Refonte progressive en 2 phases sans toucher routes/tables/RLS/hooks de données. Réutilisation de tous les dialogs existants (`UpdateHoursDialog`, `MaintenanceCompletionDialog`, `NewPointDialog`, `QRCodeGenerator`).

## Phase 1 — Structure & cartes principales

### Nouveaux composants (`src/components/equipment/detail/`)

1. **`StatusCard.tsx`** — carte dominante "État actuel"
   - Calcule statut global : Hors service > Action requise (maintenance retard) > À surveiller (point critique actif) > Maintenance > Actif
   - Affiche : badge couleur, phrase résumé, prochaine maintenance, dernier point, dernière intervention, compteur
   - Données : `useEquipmentDetail` (déjà chargé) + requête points actifs
   - Couleurs : vert / orange / violet / rouge via classes Tailwind sémantiques

2. **`CounterCard.tsx`** — extrait la zone compteur actuellement inline
   - Valeur + unité (`unite_d_usure`: heures/km/acres) + `last_wear_update` formaté
   - Bouton "Mettre à jour" → `UpdateHoursDialog`
   - État vide : "Aucun compteur enregistré" + CTA

3. **`MaintenancePriorityCard.tsx`** — top 5 maintenances triées
   - En retard → dues bientôt → planifiées → 1-2 complétées récentes
   - Actions : Voir / Marquer fait (réutilise `MaintenanceCompletionDialog`)
   - Source : `useMaintenanceTasks` déjà chargé

4. **`EquipmentPointsCard.tsx`** — points actifs liés
   - Inspection préalable du modèle `Point` : utilise `entity_id` (vérifié dans `src/types/Point.ts`) avec `type='equipement'`
   - Filtre `status != 'resolved'`, requête via le service points existant
   - Actions : Voir / Marquer résolu (mutations existantes)

5. **`MachineJournalCard.tsx`** — journal agrégé client
   - Sources : maintenances complétées, points créés, `last_wear_update`, fuel_logs, time entries, interventions
   - Tri desc, groupé "Aujourd'hui / Hier / date", max 10 + "Voir plus" → onglet Historique
   - Aucune nouvelle table

6. **`LinkedPartsCard.tsx`** — top 3 pièces liées
   - Réutilise les hooks de `EquipmentParts`
   - Badge "Stock bas" si `quantity <= reorderPoint`
   - CTA "Voir toutes" → onglet Pièces

7. **`FuelSummaryCard.tsx`** — résumé carburant
   - Dernier plein, total mois, coût ; bouton "Ajouter carburant"
   - Réutilise `useEquipmentFuelLogs`

8. **`QRCompactCard.tsx`** — wrapper compact autour de `QRCodeGenerator` avec actions Télécharger/Imprimer/Copier déjà supportées

### Composants modifiés

- **`EquipmentDetailContent.tsx`** : nouveau layout
  - Container `max-w-6xl` (desktop) / `max-w-[500px]` (mobile)
  - Header pleine largeur
  - Grille `lg:grid-cols-3 gap-6` ; col principale `lg:col-span-2`, col droite `lg:col-span-1`
  - Mobile : ordre conforme à la spec (Header → État → Actions → Compteur → Maintenance → Points → Pièces → Journal → Carburant → QR → Onglets)
  - Conserve toute la logique métier existante (mutations, dialogs, invalidations)

- **`EquipmentHeader.tsx`** : refonte premium
  - Bouton retour `<ArrowLeft/>` (navigate -1)
  - Mini photo 80×80 `rounded-2xl object-contain bg-muted/30` + fallback icône
  - Nom, type/marque/modèle, compteur résumé
  - Badge statut **traduit** : operational/active→Actif, maintenance→Maintenance, broken/out_of_service→Hors service, watch→À surveiller (avec couleurs)
  - Boutons Modifier / Supprimer alignés à droite

- **`QuickActions.tsx`** : 6 actions
  - Compteur → `UpdateHoursDialog`
  - Maintenance → `/maintenance?equipment=:id` (route déjà supportée d'après mémoire)
  - Point → `NewPointDialog` (déjà câblé dans `EquipmentDetailContent`)
  - Intervention → vérification de la route `/interventions` ; si présente : `/interventions?equipment=:id`, sinon : ouverture du `NewPointDialog` avec type adapté (fallback)
  - Lier pièce → scroll vers `LinkedPartsCard` + déclenche son CTA
  - QR → scroll vers `QRCompactCard` (ancre)
  - Grille `grid-cols-2 md:grid-cols-3 lg:grid-cols-2` selon contexte (col droite desktop)

- **`EquipmentTabs.tsx`** : 6 onglets en `grid-cols-3 sm:grid-cols-6`
  - Vue d'ensemble, Maintenance, Points (nouveau), Pièces, Historique (intègre Carburant + Performance + Temps en sous-sections), QR
  - Aucune fonctionnalité existante supprimée

## Phase 2 — Polish

- Helpers de formatage avec fallback (`formatCounterValue`, `translateStatus`, `formatRelativeDate`)
- Vérification absolue : aucun `undefined` / `null` / `Unknown` / `NaN` rendu
- Couleurs statut centralisées dans `StatusCard` et réutilisées par `EquipmentHeader`

## Validation

- Préview testée à 390px / 854px / 1366px / 1440px
- Aucun scroll horizontal (mémoire `mobile-optimization`)
- `UpdateHoursDialog`, `MaintenanceCompletionDialog`, `NewPointDialog`, `QRCodeGenerator` fonctionnels
- Build TypeScript propre
- Liste `/equipment` intacte

## Hors scope

- Aucune nouvelle route, table, RLS, ni hook Supabase majeur
- Aucun nouveau composant Settings ou navigation globale
- Pas de changement aux services/mutations existants
