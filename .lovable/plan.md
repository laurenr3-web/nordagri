# Dashboard orienté action — version raffinée

## Contexte
La refonte précédente (3 nouveaux widgets + réorganisation) n'a pas encore été implémentée dans le code. Ce plan **fusionne la refonte initiale avec les raffinements demandés** pour livrer directement la bonne version, sans étape intermédiaire.

## Ordre final des widgets
```text
0. Message d'accueil           ← NOUVEAU bandeau (pas un widget)
1. Points à surveiller         ← NOUVEAU widget
2. Tâches du jour              ← existant, simplifié + tri urgence
3. À vérifier aujourd'hui      ← NOUVEAU widget
4. Activité récente            ← NOUVEAU widget (filtré)
5. Équipements / Stats / Calendrier ← descendus
```

## 0. Message d'accueil

Bandeau statique au-dessus de la grille de widgets, dans `src/pages/Dashboard.tsx` (sous le `PageHeader`):

```text
Bonjour {prénom} 👋
Voici ce qui demande ton attention aujourd'hui
```

- Prénom: `profileData?.first_name` via `useAuthContext()`. Fallback: "Bonjour 👋".
- Une seule carte sobre, padding réduit, masquée si `!hasFarm` (banner ferme déjà affiché).

## 1. Widget Points à surveiller (avec niveau de priorité)

Fichier: `src/components/dashboard/widgets/PointsWatchWidget.tsx`
Hook: `src/hooks/dashboard/usePointsWatchData.ts`

Requête: `points where farm_id=? and status in ('open','watch') order by priority desc, last_event_at desc limit 5`.

Affichage compact (≤ 4 lignes):
- "⚠️ X points à surveiller — Y important(s)"
- 1 à 2 exemples au format **`→ {entity_label || title} ({priorité})`**
  - `critical` → "critique" (texte rouge)
  - `important` → "important" (texte ambre)
  - `normal` → "normal" (gris) — omis si la phrase devient trop longue
- Clic carte → `/points`. Vide → "Aucun point à surveiller ✓".

## 2. Tâches du jour — tri par urgence

Fichier modifié: `src/components/dashboard/widgets/PlanningTodayWidget.tsx`

Nouveau tri pour le top 2 affiché (le reste passe par "Voir toutes les tâches"):

```text
1. due_date < aujourd'hui                (en retard)
2. due_date == aujourd'hui                (du jour)
3. priorité (critical > important > todo)
4. created_at asc                         (tie-break)
```

Implémentation: tri client sur la liste fusionnée des 3 groupes déjà fournis par `usePlanningTasks`, badge "En retard" (rouge) si `due_date < today`. Compteur "X complétées / Y total" inchangé. Bouton "Voir toutes les tâches" en bas.

## 3. À vérifier aujourd'hui — sentiment d'urgence

Fichier: `src/components/dashboard/widgets/CheckTodayWidget.tsx`
Hook: `src/hooks/dashboard/useCheckTodayData.ts`

3 lignes (n'affiche que les non-zéro):
- **Points oubliés**: format `"X point(s) oublié(s) depuis N jours"` où **N = max** des `floor((now - last_event_at) / 1 day)` parmi les points oubliés (>3 jours sans événement). Si X > 1, on affiche la valeur max ("depuis jusqu'à 8 jours" optionnellement, ou simplement "depuis 8 jours" — choisi: max simple).
- **Tâches en retard**: `"X tâche(s) en retard"`
- **Maintenances dues**: `"X maintenance(s) due(s)"` (réutilise `maintenanceSuggestions`)

Tout à zéro → "Tout est à jour ✓". Chaque ligne cliquable → page concernée.

## 4. Activité récente — filtrée

Fichier: `src/components/dashboard/widgets/RecentActivityWidget.tsx`
Hook: `src/hooks/dashboard/useRecentActivityData.ts`

**Sources strictes** (3 requêtes parallèles, limit 5 chacune, fusion + tri desc, slice 5):
- Tâches **complétées** uniquement: `planning_tasks where farm_id=? and status='done'` triées par `completed_at desc`
- Points **créés** uniquement: `points where farm_id=?` triés par `created_at desc`
- **Événements ajoutés** sur un point: `point_events` joint à `points.farm_id=?` triés par `created_at desc`

**Exclus**: updates de tâches, changements de statut intermédiaires, modifications de profil, etc. — on n'interroge pas ces sources.

Format: `{icône} {phrase courte} — {temps relatif fr}`
- `✓ Tâche "Traite" complétée`
- `⚠️ Point ajouté: patte 48`
- `📝 Observation sur Tracteur JD`

Clic → page concernée. Vide → "Aucune activité récente".

## 5. Sections descendues

Réordonner `DEFAULT_WIDGETS` dans `Dashboard.tsx`. Bump de la version dans `useDashboardLayout` pour réinitialiser une fois le layout stocké en localStorage des utilisateurs existants.

## 6. Cohérence terrain (langage)

- Phrases ≤ 6-8 mots, verbes simples
- Pas de jargon ("entity", "metadata"…)
- Mêmes étiquettes de priorité partout: **critique / important / normal**
- Icônes Lucide cohérentes: `AlertCircle` (points), `CalendarCheck` (tâches), `Clock` (vérifications), `Activity` (activité)

## Détails techniques

### Fichiers créés
- `src/components/dashboard/widgets/PointsWatchWidget.tsx`
- `src/components/dashboard/widgets/CheckTodayWidget.tsx`
- `src/components/dashboard/widgets/RecentActivityWidget.tsx`
- `src/hooks/dashboard/usePointsWatchData.ts`
- `src/hooks/dashboard/useCheckTodayData.ts`
- `src/hooks/dashboard/useRecentActivityData.ts`

### Fichiers modifiés
- `src/pages/Dashboard.tsx` — bandeau d'accueil, `DEFAULT_WIDGETS` réordonné, branchement des 3 nouveaux types
- `src/hooks/dashboard/useDashboardLayout.ts` — bump version layout
- `src/hooks/dashboard/useWidgetData.ts` — branche les 3 nouveaux hooks
- `src/components/dashboard/widgets/PlanningTodayWidget.tsx` — tri urgence + compteur complétées + bouton "Voir toutes les tâches" + badge "En retard"

### Données / RLS
Aucune migration. Toutes les tables (`points`, `point_events`, `planning_tasks`) ont déjà des RLS scopées `farm_id` qui couvrent les lectures par membre.

### Performance
- Toutes les queries: `staleTime: 5 min` (règle projet), invalidées par le bouton "Actualiser" et l'autoRefresh existant
- Pas de realtime ajouté sur ces widgets (pas nécessaire pour un dashboard d'ouverture)

### Hors scope
- Pas de nouveau widget au-delà des 3 prévus
- Pas de refonte visuelle de Stats/Equipment/Calendar — uniquement déplacés
- Pas de personnalisation par utilisateur du message d'accueil
