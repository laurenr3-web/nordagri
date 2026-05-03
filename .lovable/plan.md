# Corrections dashboard NordAgri (sans refonte)

Audit terminé. Voici les vrais bugs détectés et leurs corrections ciblées.

## 1. Raccourcis cassés (priorité)

### Bug #1 — "Nouvelle tâche" ne déclenche rien
`QuickActionBottomSheet` dispatch `planning:n-task` mais `PlanningContent.tsx` (ligne 44) écoute `planning:open-add-task`. Mismatch → le formulaire ne s'ouvre jamais.

**Fix** : aligner sur l'event existant `planning:open-add-task` dans `QuickActionBottomSheet.tsx`.

### Bug #2 — "Nouvel équipement" event non écouté
On dispatch `n-equipment-dialog`, mais le seul listener réel est `open-add-equipment-dialog` (`useEquipmentDialogs`, `EquipmentDialogs.tsx`).

**Fix** : dispatcher `open-add-equipment-dialog` uniquement.

### Bug #3 — Raccourcis manquants demandés
Ajouter dans `QuickActionBottomSheet` :
- **Scanner QR** → `/scan` (route existante `ScanRedirect`)
- **Ajouter pièce** → `/parts`
- **Plein carburant / Heures machine** → `/equipment` (fallback simple, aucun event listené)

Réorganiser la grille 3 colonnes (max 6 actions visibles), retirer les doublons "Voir équipements / Voir planification" qui dupliquent la nav.

### Bug #4 — FirstActionCard : 3 boutons mènent au même endroit
Actuellement « Marquer fait », « Ouvrir fiche », « Voir la priorité » naviguent tous vers `action.ctaPath`.

**Fix** :
- "Marquer fait" → navigue vers la page source (pas de mutation côté dashboard pour éviter casser des règles).
- "Ouvrir fiche" → si `equipmentId` présent (maintenance), `/equipment/:id` ; sinon masquer le bouton.
- "Voir la priorité" → routing par `source` :
  - maintenance → `/maintenance`
  - point → `/points`
  - planning → `/planning`

Étendre `useFirstAction` pour exposer `equipmentId` (déjà sélectionné dans la requête) sur les actions de type maintenance.

### Bug #5 — Event listeners pages cibles
- `Planning.tsx` : ajouter écoute de `planning:open-add-task` au niveau page (déjà fait dans `PlanningContent`, OK).
- `Maintenance.tsx` : conserve `maintenance:n-task` (OK).
- `PointsPage.tsx` : conserve `points:n-point` (OK).

Aligner les noms côté `QuickActionBottomSheet` :
```
Nouvelle tâche      → /planning      + planning:open-add-task
Point à surveiller  → /points        + points:n-point
Maintenance         → /maintenance   + maintenance:n-task
Nouvel équipement   → /equipment     + open-add-equipment-dialog
Scanner QR          → /scan          (no event)
Ajouter pièce       → /parts         (no event)
```

Conserver `setTimeout(..., 250)` après navigate avant dispatch.

### Bug #6 — ContextBar
Liens actuels OK (`/time-tracking`, `/planning`, `/points`). Aucune correction de routing nécessaire, seulement du cadrage (cf. §2).

### Bug #7 — ActiveTeamCard
Lignes membres non cliquables. **Fix** : rendre chaque `<li>` un `<button>` → `/time-tracking`.

### Bug #8 — WorkTodayCard
Toutes les lignes vont à `/planning`. OK comme fallback (pas de page détail tâche). Aucun changement.

## 2. Cadrage texte / alignement

### FirstActionCard
- Wrapper titre/sous-titre : ajouter `overflow-hidden` en plus de `min-w-0`.
- Sous-titre : `truncate` (déjà), titre : passer en `line-clamp-2` (déjà OK).
- Boutons d'actions : ajouter `flex-wrap gap-2` au conteneur, retirer `ml-auto` du dernier bouton (provoque débordement à 360-390px) → utiliser `w-full sm:w-auto` ou simplement laisser les 3 boutons s'enrouler.
- Vignette icône : déjà `flex-shrink-0` ✓.

### WorkTodayCard
- Conteneur ligne : ajouter `overflow-hidden` au div texte (`flex-1 min-w-0`).
- Badge à droite : `shrink-0 whitespace-nowrap` (whitespace manquant).
- Vignette gauche : `shrink-0` (déjà via `flex-shrink-0`).

### ActiveTeamCard
- Wrapper texte : ajouter `overflow-hidden`.
- Durée : ajouter `whitespace-nowrap`.
- Footer "non assignées" : `truncate` sur le span de texte (déjà), ajouter `whitespace-nowrap` sur "Assigner".

### DashboardContextBar
- Sur très petits écrans (≤360px), label long déborde. **Fix** :
  - utiliser libellés courts: "actifs", "non assig.", "à surveiller" → garder court.
  - chip : `min-w-0` sur le bouton (déjà), label : `truncate` (déjà), icône+chevron `shrink-0` (déjà).
  - réduire `gap-1.5` → `gap-1` et `px-3` → `px-2.5` pour 360px.

### DashboardHeader
- Bloc droite (avatar) : OK.
- `farmName` truncate déjà appliqué. RAS.

## 3. Responsive

- `Dashboard.tsx` : `pb-24 lg:pb-8` déjà OK.
- Vérifier que la grille `grid-cols-1 lg:grid-cols-12` n'introduit pas de débordement ; ajouter `min-w-0` sur les colonnes `lg:col-span-8` et `lg:col-span-4` pour empêcher le contenu enfant de forcer un overflow.
- Cartes : ajouter `overflow-hidden` sur `FirstActionCard`, `WorkTodayCard`, `ActiveTeamCard` racines (déjà sur certaines).

## 4. Fichiers modifiés

```
src/components/dashboard/v2/QuickActionBottomSheet.tsx   (events + actions)
src/components/dashboard/v2/FirstActionCard.tsx          (routing 3 boutons + wrap)
src/components/dashboard/v2/WorkTodayCard.tsx            (overflow + whitespace badge)
src/components/dashboard/v2/ActiveTeamCard.tsx           (lignes cliquables + nowrap)
src/components/dashboard/v2/DashboardContextBar.tsx      (gap/padding compact)
src/hooks/dashboard/v2/useFirstAction.ts                 (exposer equipmentId)
src/pages/Dashboard.tsx                                  (min-w-0 sur colonnes)
```

Aucune nouvelle route, aucune migration, aucune RLS, aucune suppression. Build TS vérifié à la fin.
