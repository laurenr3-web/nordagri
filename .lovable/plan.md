# Plan — Allègement des cartes de tâche Planification

Objectif : carte plus compacte, boutons équilibrés (aucun ne domine), une seule ligne d'actions, badge temps simplifié. Aucune logique métier touchée.

## 1. `TaskTimeControls.tsx` — Équilibrer les boutons

**Problème** : "Terminer session" est en variant par défaut (vert/primary plein) → domine visuellement face à "Terminer tâche" (outline).

**Changements** :
- Bouton **"Terminer session"** (cas `in_progress` + session active) : passer de variant par défaut → `variant="secondary"`. Garde la même taille/padding que "Terminer tâche".
- Conserver `variant="outline"` pour "Terminer tâche", "Démarrer", "Reprendre", "Débloquer".
- Réduire la hauteur uniforme : `btnSize` carte passe de `h-9 text-xs` → `h-8 text-xs` (respect contrainte h-8/h-9 max, plus compact).
- Retirer `flex-wrap` du conteneur in_progress → forcer une seule ligne (les deux boutons compacts tiennent à 390px car icônes 3.5w + texte court).
- Garder `justify-end` pour l'alignement à droite dans la ligne d'action partagée.

Résultat : deux boutons côte à côte, même taille, même poids visuel (secondary ≈ outline en intensité), ergonomie tactile préservée.

## 2. `TaskCard.tsx` — Une seule ligne d'actions + densité

**Changements layout** :
- Bloc d'actions bas (lignes 153-211) : déjà `flex items-center justify-between` — retirer `flex-wrap` pour forcer une vraie ligne unique. Ajouter `min-w-0` au conteneur droit pour autoriser la compression si besoin.
- Réduire `space-y-1.5` → `space-y-1` sur la `Card` pour densifier.
- Padding carte : `p-3` reste (déjà compact). Pas de changement.
- Bouton "Prendre" : harmoniser à `h-8` (était `h-7`) pour matcher la hauteur des boutons temps → alignement vertical parfait.
- Trigger "Non assignée" : passer en `h-8` également.

## 3. `TaskTimeBadge.tsx` — Simplifier ("● 19 min · 2 sessions")

**Problème** : badge "Clock 19 min · 2 sessions" + badge séparé "● En cours" = redondance.

**Refactor** :
- Fusionner en un seul élément.
- Si `stats.hasActive` :
  - Préfixe = pastille verte pulsante (` ● `) au lieu d'icône Clock.
  - Texte vert atténué : `text-green-700 dark:text-green-300`.
  - Format : `● 19 min · 2 sessions` (sans le mot "En cours").
- Sinon (pas de session active, mais sessions passées) :
  - Conserver l'icône `Clock` discrète, fond `bg-muted`.
  - Format : `19 min · 2 sessions`.
- Supprimer le second `<span>` "En cours".

Un seul badge sur la carte → moins de bruit visuel, le point vert pulsant suffit comme indicateur d'état actif.

## 4. Ce qui ne change PAS

- `usePlanningTaskTime.ts`, `planningTimeService.ts`, `planningService.ts` — aucune modification.
- Mutations `start/resume/pause/complete/unblock` — inchangées.
- `TaskDetailDialog.tsx` (variant `dialog`) — inchangé, garde `h-10`.
- Types, RLS, schémas DB — non concernés.

## Critères d'acceptation

- [ ] Une seule ligne d'actions en bas de la carte (assignation à gauche, temps à droite).
- [ ] "Terminer session" et "Terminer tâche" visuellement équilibrés (secondary + outline, même hauteur/padding).
- [ ] Aucun bouton pleine largeur ni vert plein dominant.
- [ ] Badge temps unifié : `● 19 min · 2 sessions` quand actif, sinon icône Clock seule.
- [ ] Densité accrue (`space-y-1`).
- [ ] Aucun scroll horizontal à 390px.
- [ ] Aucune régression : toutes les actions temps fonctionnent comme avant.

## Fichiers modifiés

```text
src/components/planning/TaskCard.tsx          (layout + densité)
src/components/planning/TaskTimeControls.tsx  (variant secondary, h-8, no wrap)
src/components/planning/TaskTimeBadge.tsx     (fusion badge actif)
```
