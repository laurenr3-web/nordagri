# Refonte premium du module `/time-tracking`

## Objectif
Transformer la page Suivi du temps en outil de punch et suivi d'équipe clair et premium, avec 4 onglets (**Vue du jour**, **Équipe**, **Historique**, **Rapports**). Aucune nouvelle route, aucune migration DB, aucune RLS modifiée.

## Fichiers modifiés
- `src/components/time-tracking/dashboard/TimeTrackingPage.tsx` — réécriture du layout en 4 onglets, suppression des KPI/filtres/tables affichés en haut.
- `src/components/time-tracking/dashboard/TimeTrackingTabs.tsx` — 4 onglets (Vue du jour / Équipe / Historique / Rapports), trigger actif vert souligné, grille fixe mobile (pas de scroll horizontal).
- `src/components/time-tracking/dashboard/TimeTrackingHeader.tsx` — titre « Suivi du temps », sous-titre date + statut sync, bouton « + Nouvelle session » (vert).
- `src/components/time-tracking/dashboard/ActiveTimeSession.tsx` — carte hero premium, durée géante `XhYY`, badge « Session active », sous-texte « Depuis HH:MM », travail + équipement/poste fallback, boutons **Terminer** / **Modifier**, état vide si aucune session.
- `src/components/time-tracking/dashboard/TimeTrackingSummary.tsx` — grille 2x2 KPI (Mon temps, Temps équipe, Sessions actives, Sessions terminées), `rounded-2xl`, gros chiffres.
- `src/components/time-tracking/team/TeamSection.tsx` — barre de recherche, badges « Accès app » / « Sans compte », actions Voir sessions / Inviter / Assigner.
- `src/components/time-tracking/TimeEntryForm.tsx` — accepte un nouveau prop `defaultTaskType?: TimeEntryTaskType` (alimente `formData.task_type` à l'ouverture si fourni et pas d'`initialData`).

## Fichiers créés (sous `src/components/time-tracking/dashboard/`)
- `DayViewTab.tsx` — assemble la Vue du jour ; grille `grid-cols-12` desktop, `flex-col` mobile.
- `QuickStartGrid.tsx` — 6 raccourcis (Animaux, Champs, Équipement, Maintenance, Bâtiments, Autre) ; au clic, ouvre `TimeEntryForm` avec `defaultTaskType` mappé. Lien « Ou créer une session personnalisée → ».
- `ActiveTeamCard.tsx` — basé sur `useFarmTeamStatus`, max 3 mobile / 6 desktop, footer « N membres actifs · total XhYY », fallback initiales, jamais d'`undefined`.
- `RecentSessionsCard.tsx` — basé sur `useTimeTrackingEntries` (déjà chargé), 3 mobile / 5 desktop, durée `XhYY`, badge Active/Terminée, plage horaire `HH:mm - HH:mm` ou `HH:mm - En cours`.
- `WorkTypeChartCard.tsx` — wrapper donut basé sur `useTimeBreakdown`, total au centre `XhYY`, légende. Affiché desktop dans Vue du jour ; sur mobile uniquement dans Rapports (via `useIsMobile`).
- `DailyTipBanner.tsx` — bandeau vert très pâle, icône feuille, copy fixe.
- `HistoryTab.tsx` — chips Aujourd'hui/Semaine/Mois, accordion « Filtres avancés » (membre, équipement, type, statut, période perso), liste de cartes mobile / table légère desktop, basée sur `useTimeTrackingEntries`.

## Fichier nouveau (utilitaire)
- `src/utils/timeFormat.ts` — helper `formatHM(ms: number)` et `formatHMRange(start, end?)` retournant `0h26`, `2h15`, `10h05`. Utilisé partout (Active session, Team card, Recent sessions, Summary).

## Détails techniques

### Détection session active
```ts
const isActive = (s) => s.status === 'active' || s.end_time == null;
```

### Mapping QuickStart → TaskType
Les types valides existants : `maintenance | repair | inspection | operation | other`.
- Animaux → `operation` + `custom_task_type: 'Animaux'`
- Champs → `operation` + `custom_task_type: 'Champs'`
- Équipement → `operation`
- Maintenance → `maintenance`
- Bâtiments → `other` + `custom_task_type: 'Bâtiments'`
- Autre → `other`

Passage via `initialData={{ task_type, custom_task_type }}` (déjà supporté par `TimeEntryForm`). Pas besoin du nouveau prop `defaultTaskType` strictement, mais on l'ajoute pour clarté ergonomique.

### Layout
```text
Desktop (lg+) :
  Row 1 : ActiveSession (col-span-6) | ActiveTeam (col-span-3) | QuickStart (col-span-3)
  Row 2 : Summary (col-span-3) | RecentSessions (col-span-6) | WorkTypeChart (col-span-3)
  Row 3 : DailyTip (col-span-12)

Mobile :
  ActiveSession → QuickStart → ActiveTeam → Summary → RecentSessions → DailyTip
  (WorkTypeChart masqué, présent uniquement dans Rapports)
```

### Style
- Cartes : `rounded-2xl shadow-sm bg-card`, padding `p-5 sm:p-6`.
- Couleur principale : token `primary` (vert NordAgri déjà en place).
- Typo : durée hero `text-5xl font-bold tabular-nums`, KPI `text-3xl font-semibold`.

### Hygiène Tailwind
- Conteneurs flex avec texte : `min-w-0`.
- Avatars / badges / durées / boutons : `shrink-0`.
- `truncate` sur sous-textes seulement, `line-clamp-2` sur titres importants.
- `whitespace-nowrap` réservé aux durées et badges courts.

### Aucun changement
- Tables, RLS, fonctions DB, edge functions, routes — inchangés.
- `useTimeTracking`, `useTimeTrackingData`, `useFarmTeamStatus`, `useTimeTrackingEntries`, `useTimeTrackingStats` — inchangés (consommés tels quels).
- Logique punch in / pause / reprise / stop — inchangée (handlers déjà branchés dans `useTimeTrackingData`).
- `TimeTrackingRapport` — déplacé tel quel dans l'onglet Rapports.

## Validation
- Build TypeScript automatique (harness).
- Préviews 390 / 768 / 1366 / 1920 : pas de scroll horizontal.
- Punch in / out / pause / reprise via la carte Active fonctionnent.
- Session sans `equipment_id` affiche poste ou type, jamais `undefined`.
- QuickStart ouvre bien le dialog avec type prérempli.
