## Problème identifié

La RLS de `time_sessions` est stricte : `user_id = auth.uid()`. Aucun membre ne peut voir les sessions des autres → `useActiveTeam` ne retourne jamais les coéquipiers, et même pour soi le filtre `status='active'` peut rater une ligne avec `end_time IS NULL`. La table fiable pour le périmètre ferme est `work_shifts` (RLS = `is_farm_member(farm_id)`), avec un index unique sur `(user_id) WHERE status='active'`.

## Approche

Adosser la notion "punch in" à `work_shifts.status='active'` (la source de vérité), puis enrichir avec la `time_sessions` active de l'utilisateur si visible (sinon on affiche juste la durée du shift et "Session active").

### 1. `useActiveTeam` (refonte)

- Charger membres ferme (owner + farm_members) → ids.
- Charger `work_shifts` actifs : `farm_id = farmId AND status = 'active'` → liste des utilisateurs réellement punch in.
- Charger `profiles` (id, first_name, last_name, avatar_url) pour ces user_ids.
- Charger `time_sessions` actives (`status='active' OR end_time IS NULL`) restreintes à `user_id IN (userIds)` — la RLS filtrera côté DB ; en pratique on récupère seulement la sienne, ce qui suffit pour enrichir l'auto-affichage.
- Pour chaque shift actif :
  - `name`, `avatarUrl` depuis profiles.
  - `startTime` = `punch_in_at` du shift (fallback durée).
  - Si une `time_sessions` active existe : `equipmentName` (join `equipment_ref:equipment_id(name)`), `title` = `title || description || poste_travail || 'Session active'`.
  - Sinon : `title = 'Session active'`, `equipmentName = null`.
- Trier par `punch_in_at` desc.

### 2. `ActiveTeamCard`

- Limites : `mobile = 3`, `desktop = 5` via prop `limit` passé depuis `Dashboard.tsx` (utiliser `useIsMobile`).
- Afficher `+ N autres actifs` si `team.length > limit`.
- Empty state : "Aucune session active" + bouton "Démarrer suivi du temps" → `/time-tracking`.
- Conserver la ligne "tâches non assignées" (déjà OK).

### 3. Onglet "Équipe" dans `/time-tracking`

- Nouveau hook `useFarmTeamStatus(farmId)` :
  - Charge `farms.owner_id` + `farm_members` → liste de user_ids + role.
  - Charge `profiles` (nom, avatar).
  - Charge `work_shifts` actifs de la ferme → map user_id → shift actif.
  - Charge `work_shifts` derniers terminés (top 1 par user, dernier mois) → `last_activity`.
  - Pour les utilisateurs actifs visibles (= soi), tente d'enrichir avec `time_sessions` active.
  - Charge `planning_tasks` count par `assigned_to` pour aujourd'hui.
- Nouveau composant `TeamSection.tsx` (mobile-first, cartes compactes) :
  - Liste : avatar, nom, badge Actif/Inactif (vert/gris), travail en cours + durée si actif, sinon "Dernière activité {date}" ou "—", "{N} tâche(s) aujourd'hui".
  - Pas de scroll horizontal, grille empilée mobile, 2 colonnes ≥ md.
- Ajouter un onglet `team` dans `TimeTrackingTabs.tsx` (icône `Users`) avant `Liste` ou après `Rapport`. Pas de nouvelle route.

### 4. Validation

- Punch in sans équipement → on apparaît avec "Session active" + durée du shift.
- Punch in avec session équipement → "Chargeur Volvo" + titre.
- Aucun shift actif → empty state avec CTA `/time-tracking`.
- Mobile ≤ 3, desktop ≤ 5, overflow `+N autres actifs`.
- Membres inactifs : absents du dashboard, présents dans onglet Équipe avec "Inactif".

## Fichiers modifiés / créés

- `src/hooks/dashboard/v2/useActiveTeam.ts` (refonte basée sur `work_shifts`).
- `src/components/dashboard/v2/ActiveTeamCard.tsx` (limites + empty CTA + overflow).
- `src/pages/Dashboard.tsx` (passer `limit` selon `useIsMobile`).
- `src/hooks/time-tracking/useFarmTeamStatus.ts` (nouveau).
- `src/components/time-tracking/team/TeamSection.tsx` (nouveau).
- `src/components/time-tracking/dashboard/TimeTrackingTabs.tsx` (ajouter onglet Équipe).

Aucune migration DB, aucune nouvelle route, aucune modif RLS.
