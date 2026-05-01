
## Objectif

Alléger visuellement les actions dans les cartes Planification et permettre de **terminer une session de temps** directement depuis la carte, sans aller dans le module Suivi de temps.

## Constat

La logique métier requise existe déjà :

- `pause.mutate({ taskId })` ferme la session active (`status='completed'`, `end_time=now()`) et passe la tâche en `paused`. C'est exactement le comportement attendu pour "Terminer session".
- `complete.mutate({ taskId })` ferme la session + tâche en `done` (= "Terminer tâche").

**Aucune modification** des services, hooks, types ou migrations. Uniquement deux fichiers UI.

## Changements

### 1. `src/components/planning/TaskTimeControls.tsx` (édition UI seule)

Renommage et allègement visuel des boutons. Aucun changement de logique de mutation.

**État `todo` — Démarrer**
- Avant : `<Button size="sm" className="flex-1 ...">` (h-9, primary, plein largeur)
- Après : `<Button size="sm" variant="outline">` compact (`px-3`, h-9), icône `Play`, **sans `flex-1`**.
- Container : `flex justify-end gap-2`.

**État `paused` — Reprendre + Terminer tâche**
- "Reprendre" : `variant="outline"`, sans `flex-1`, icône `Play`.
- "Terminer tâche" : `variant="outline"`, icône `Flag` (au lieu de `CheckCircle2`, pour différencier de "Terminer session").
- Container : `flex justify-end gap-2`.

**État `in_progress` sans session active — Reprendre**
- `variant="outline"`, sans `flex-1`, icône `Play`.
- Container : `flex justify-end gap-2`.

**État `in_progress` + session active — Terminer session + Terminer tâche**
- "Terminer session" (remplace "Arrêter") : `variant="default"` (primary, sobre, **pas d'ambre**), `flex-1`, icône `CheckCircle2`. Label : "Terminer session".
  - Comportement inchangé : appelle `pause.mutate({ taskId })`.
- "Terminer tâche" : `variant="outline"`, `flex-1`, icône `Flag`.
- Container : `flex gap-2` (deux boutons équilibrés).

**État `blocked` — Débloquer**
- `variant="outline"`, sans `flex-1`, icône `Unlock`. Container `flex justify-end gap-2`.

Imports lucide ajustés : retirer `Square`, ajouter `Flag`. Garder `Play`, `CheckCircle2`, `Unlock`.

Hauteur uniforme : `h-9 text-xs` (variant card), inchangée pour `dialog` (`h-10 text-sm`).

### 2. `src/components/planning/TaskCard.tsx` (édition layout)

**Spacing carte** : `p-3 space-y-2` → `p-3 space-y-1.5`.

**Fusion ligne assignation + ligne actions temps en une seule ligne** :

Aujourd'hui le bloc d'assignation (`{isUnassigned && ...}`) et le bloc `<TaskTimeControls>` sont rendus sur deux lignes séparées. Les fusionner en un wrapper unique :

```tsx
{(isUnassigned || enableTimeTracking) && (
  <div className="flex items-center justify-between gap-2">
    <div className="flex items-center gap-2 min-w-0">
      {isUnassigned ? <PopoverAssignation /> : <span />}
    </div>
    {enableTimeTracking && (
      <TaskTimeControls task={task} userId={user?.id ?? null} variant="card" />
    )}
  </div>
)}
```

- Si tâche assignée : seul le bloc droit (actions temps) est visible, naturellement aligné à droite grâce à `justify-between` et le `<span />` vide à gauche.
- Si tâche non assignée + actions disponibles : "Non assignée ▾" + "Prendre" à gauche, action temps à droite.
- Le badge du membre assigné reste dans la ligne supérieure (badges) — inchangé.

**`TaskTimeBadge`** (durée cumulée + indicateur live) reste sur sa propre ligne, juste au-dessus de la nouvelle ligne d'actions, car c'est de l'information et non une action.

### 3. `src/components/planning/TaskDetailDialog.tsx`

Aucun changement nécessaire. Le composant utilise `<TaskTimeControls variant="dialog">`, donc les nouveaux labels et couleurs se propagent automatiquement.

## Critères d'acceptation

- "Arrêter" disparaît partout, remplacé par "Terminer session" (même comportement via `pause`).
- Aucun bouton en pleine largeur (pas de `w-full` ni `flex-1` solitaire).
- Aucune couleur agressive (plus d'`bg-amber-600`).
- État `todo` → un seul bouton "Démarrer" compact en outline, aligné à droite.
- État `in_progress` actif → "Terminer session" + "Terminer tâche" équilibrés (`flex-1` chacun, gap-2).
- Carte plus dense verticalement (`space-y-1.5`).
- Mobile 390px : aucun scroll horizontal, hauteur ≥ 36px (h-9).
- Aucun `any`, aucun nouveau package, aucun `setInterval`/`setTimeout`, aucune modification de service ou hook.

## Fichiers touchés

- `src/components/planning/TaskTimeControls.tsx` (édition)
- `src/components/planning/TaskCard.tsx` (édition)
