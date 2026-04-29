# Module "Points à surveiller" — Plan unifié (création + raffinements)

Le module n'existe pas encore en base ni en code. Ce plan intègre directement vos raffinements : champs simplifiés, statuts traduits, timeline immuable avec corrections, trigger SQL automatique, indicateur de fraîcheur, création de tâches liées, bucket dédié.

## 1. Base de données (migration unique)

### Table `points`
- `id` uuid PK
- `farm_id` uuid NOT NULL
- `type` text — `animal` / `equipement` / `champ` / `batiment` / `autre`
- `entity_id` uuid NULLABLE (réservé V2, non utilisé en V1)
- `entity_label` text — texte libre, ex. "Vache #142"
- `title` text NOT NULL — **description du problème** (champ unique, pas de `description` séparée)
- `priority` text DEFAULT `'normal'` — `critical` / `important` / `normal`
- `status` text DEFAULT `'open'` — `open` / `watch` / `resolved`
- `created_by` uuid NOT NULL
- `created_at`, `updated_at` timestamptz DEFAULT now()
- `last_event_at` timestamptz — mis à jour par trigger
- `resolved_at` timestamptz NULLABLE

### Table `point_events`
- `id` uuid PK
- `point_id` uuid NOT NULL
- `event_type` text — `observation` / `action` / `verification` / `note` / **`correction`**
- `note` text
- `photo_urls` text[] DEFAULT `{}`
- `created_by` uuid NOT NULL
- `created_at` timestamptz DEFAULT now()

Pas d'UPDATE/DELETE possible sur `point_events` (timeline immuable). Les corrections passent par un nouvel événement `correction`.

### Trigger SQL automatique
```
on insert into point_events
  → update points set updated_at = now(), last_event_at = now() where id = NEW.point_id
```
Aucune logique de date côté client.

### RLS (pattern existant `is_farm_member` / `has_farm_role`)
- **points** : SELECT si `is_farm_member(farm_id)` ; INSERT/UPDATE si `has_farm_role(farm_id, 'member')` ; DELETE si admin OU créateur.
- **point_events** : SELECT/INSERT via membership de la ferme du point parent ; pas d'UPDATE/DELETE.

## 2. Storage
- Nouveau bucket privé **`point_photos`** (séparé d'`equipment_photos`).
- Politiques storage : lecture/écriture aux membres de la ferme propriétaire du point. URLs signées 1h côté client (pattern existant).

## 3. Renommage du module Interventions
- Routes : `/interventions` → `/points` (avec redirect pour compat).
- Navigation (`Navbar.tsx`, `MobileMenu.tsx`) : "Interventions" → **"Points à surveiller"**.
- Traductions `fr.json` / `en.json`.
- Suppression de `src/components/interventions/`, `src/hooks/interventions/`, `src/pages/Interventions.tsx`, `src/types/Intervention.ts` (aucune dépendance externe critique).
- **Aucune migration des données** de la table `interventions` (repart à zéro).

## 4. Nouveau front

### Arborescence
```
src/pages/Points.tsx
src/components/points/
  PointsPage.tsx           — 3 sections empilées
  PointCard.tsx            — carte mobile-first
  NewPointDialog.tsx       — création (Sheet sur mobile)
  PointDetailDialog.tsx    — header + timeline + tâches liées
  PointTimeline.tsx
  AddEventDialog.tsx       — ajout d'événement (5 types)
  CreateLinkedTaskDialog.tsx — créer tâche liée au point
  StatusBadge.tsx, PriorityBadge.tsx
  pointHelpers.ts          — labels FR, icônes type, freshness
src/hooks/points/
  usePoints.ts, usePointEvents.ts, usePointMutations.ts, usePointLinkedTasks.ts
src/types/Point.ts
```

### Page principale (mobile-first)
- Bouton primaire **+ Ajouter un point** (gros, visible).
- 3 sections empilées avec compteurs :
  1. **En cours** (`open`) — dépliée
  2. **À surveiller** (`watch`)
  3. **Réglés** (`resolved`) — repliée
- Cartes triées par `last_event_at` desc.

### Carte d'un point
- Icône selon **type** (🐄 / 🚜 / 🌾 / 🏠 / autre).
- `entity_label` en gras + `title` sous-titre.
- Badges : priorité (couleur) + statut traduit.
- **Icône du dernier event_type** : 👀 observation / 🔧 action / ✅ vérification / 📝 note / ⚠️ correction.
- **Pastille fraîcheur** basée sur `last_event_at` :
  - 🟢 aujourd'hui
  - 🟡 2-3 jours
  - 🔴 > 3 jours
- "Dernière activité : il y a X j" (1 ligne).
- "Ouvert depuis X jours".

### Création (NewPointDialog) — < 10 s
- Type (5 chips icônes)
- Élément concerné (input texte → `entity_label`)
- **Description du problème** (textarea → `title`)
- Priorité (3 chips, défaut "normal")
- Note initiale optionnelle
- Photo optionnelle (bucket `point_photos`)

À la création : insert `points`, puis si note → insert `point_events` (type `note`). Le trigger met à jour `last_event_at` automatiquement.

### Détail (PointDetailDialog)
- Header sticky : icône type, `entity_label`, titre, badges statut+priorité.
- Bouton **Changer statut** (popover : En cours / À surveiller / Réglé). Si `resolved` → set `resolved_at = now()`.
- **Timeline** chronologique inverse : pastille couleur par event_type, date relative, note, photos thumbnails. Événements `correction` mis en évidence (bordure ambre).
- FAB **+ Ajouter une note / action** → AddEventDialog (5 types : observation, action, vérification, note, correction).
- **Section "Tâches liées"** : query sur `planning_tasks` où `source_module='points' AND source_id=point.id`. Affiche titre, statut (À faire/Fait), date assignée. Tap → navigation vers Planning.
- Bouton **+ Créer une tâche** → CreateLinkedTaskDialog.

### CreateLinkedTaskDialog
Champs minimaux :
- Titre (pré-rempli avec `title` du point)
- Assigné à (membres de la ferme)
- Date (défaut aujourd'hui)
- Priorité (héritée du point)
- Note optionnelle

Insert dans `planning_tasks` avec :
- `source_module = 'points'`
- `source_id = point.id` (cast text de l'uuid — colonne déjà text)
- `farm_id`, `created_by`, `category = 'autre'`

## 5. Statuts — règle stricte UI
Jamais afficher `open` / `watch` / `resolved` à l'utilisateur. Mapping centralisé dans `pointHelpers.ts` :
- `open` → "En cours"
- `watch` → "À surveiller"
- `resolved` → "Réglé"

## 6. Sécurité & multi-tenant
- Toutes les requêtes filtrent par `farm_id` via `useFarmId`.
- Insertions injectent `farm_id` + `created_by = auth.uid()`.
- RLS empêche tout accès cross-ferme.

## 7. Hors scope V1
- `entity_id` (lien typé vers équipement/animal) — gardé NULL.
- Édition/suppression d'événements (timeline immuable, corrections via type `correction`).
- Récurrence, notifications push, auto-assignation.
- Migration des `interventions` existantes.

## 8. QA
- `/interventions` redirige vers `/points`.
- RLS : user d'une autre ferme ne voit rien.
- Trigger : `last_event_at` se met à jour à chaque insert event.
- Carte : icône dernier event + pastille fraîcheur correctes.
- Tâche liée visible côté Point ET côté Planning.
- Création point < 10 s, ajout événement < 5 s sur mobile 390px.

---

Prêt à implémenter. Approuvez pour lancer la migration SQL + le code front.
