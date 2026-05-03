## Objectif

Remplacer `/dashboard` (widgets DnD legacy) par un poste de commande mobile premium + vue desktop 2 colonnes, sans nouvelle route, table ou RLS.

## Fichiers créés

**Hooks** (`src/hooks/dashboard/v2/`)
- `useFirstAction.ts` — calcule la priorité dominante : maintenance en retard > points critiques > tâche planning critique > tâche planning du jour. Réutilise `useMaintenanceTasks`, `usePoints`, `usePlanningTasks` existants.
- `useDashboardSignals.ts` — agrège: tâches non assignées, sessions actives (`time_sessions`), pièces sous seuil (`parts_inventory`).
- `useActiveTeam.ts` — sessions `time_sessions` ouvertes joint sur `profiles` + `equipment`.

**Composants** (`src/components/dashboard/v2/`)
- `DashboardHeader.tsx` — salutation + date.
- `DashboardContextBar.tsx` — 3 chips (membres actifs, tâches non assignées, alertes stock).
- `FirstActionCard.tsx` — carte dominante avec CTA, source, badge priorité.
- `WorkTodayCard.tsx` — liste 3 (mobile) / 5 (desktop) tâches du jour, exclut l'ID de la First Action.
- `ActiveTeamCard.tsx` — avatars + équipement courant.
- `DesktopWatchPoints.tsx` — points à surveiller (sans répéter total).
- `FleetStatus.tsx` — état flotte (opérationnel/maintenance/HS).
- `BlockersCard.tsx` — interventions bloquées, stock critique.
- `StatsCard.tsx` (v2) — KPIs essentiels.
- `MobileFab.tsx` — bouton + flottant central avec safe-area.
- `QuickActionBottomSheet.tsx` — sheet : nouvelle tâche, intervention, scan QR, saisie carburant.
- `DesktopDashboardGrid.tsx` — grille 12 colonnes desktop.

## Fichiers modifiés

- `src/pages/Dashboard.tsx` — remplacer entièrement par layout responsive : header, ContextBar, FirstActionCard, WorkTodayCard, ActiveTeamCard (mobile, colonne unique). Desktop (lg+): 2 colonnes via `DesktopDashboardGrid`. Conserver `CreateFarmDialog`, `useFarmId`, banner "pas de ferme", empty state onboarding. Supprimer DnD/customizer/tabs.
- `src/components/layout/MobileMenu.tsx` — réduire à 4 QuickButtons + FAB central qui ouvre `QuickActionBottomSheet`. Le bouton "Plus" devient une entrée du sheet ou reste à droite ; le FAB + occupe le centre, surélevé via `-mt-6` ou positionnement absolu.

## Règles UX/Tech

- Aucun scroll horizontal mobile.
- FAB central, taille 56px, `bottom: calc(env(safe-area-inset-bottom) + 1rem)`.
- Bottom sheet utilise `Sheet` shadcn existant.
- Anti-répétition : First Action exclue de Work Today (filtrage par id source).
- Fallback propre si données vides (skeleton court + message).
- Pas de nouvelles routes : tous CTA naviguent vers routes existantes (`/maintenance`, `/planning`, `/equipment/:id`, `/parts`, `/interventions`, `/qr-scanner` si existe sinon `/equipment`).
- Pas de migration DB, pas de RLS, pas de nouvelle table.
- Static imports uniquement (règle préview Lovable).

## Validation

- Build TS propre.
- Vérification lg breakpoint : sidebar `DesktopShell` conservée.
- Vérification mobile 375px : pas d'overflow horizontal.