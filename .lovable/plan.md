

# Plan — Amélioration esthétique de la vue Semaine

## Problème
La vue Semaine est visuellement plate : titres de jours simples, pas de séparation visuelle claire, les jours sans tâches prennent autant de place que les jours actifs, et les cartes sont enveloppées inutilement dans un `TaskGroup` avec label vide.

## Changements

### `src/components/planning/WeekView.tsx`

1. **En-têtes de jours plus élégants** : remplacer le `h3` simple par une ligne avec un badge de date arrondi, le nom du jour complet en français, et une pastille pour le nombre de tâches. Le jour actuel aura un fond coloré (primary) pour ressortir.

2. **Jours sans tâches** : afficher une ligne discrète avec un tiret ou texte léger au lieu d'un bloc `Aucune tâche`, pour réduire l'espace vertical.

3. **Jours passés sans tâches** : les masquer complètement pour épurer la vue (seuls les jours passés AVEC tâches restent visibles).

4. **Rendu des tâches directement via `TaskCard`** au lieu d'un `TaskGroup` avec label vide — supprime le wrapper inutile.

5. **Séparation visuelle entre jours** : ajouter un `Separator` ou un `border-b` subtil entre chaque jour.

6. **Noms de jours complets** : utiliser `Lundi`, `Mardi`, etc. au lieu de `Lun`, `Mar` pour plus de lisibilité.

### Résultat visuel attendu

```text
┌──────────────────────────────────┐
│ 📍 Lundi 5 avril — Aujourd'hui  │  ← fond primary/10, badge primary
│   ┌─ carte tâche ─────────────┐ │
│   └────────────────────────────┘ │
├──────────────────────────────────┤
│   Mardi 6 avril                  │  ← pas de tâches, ligne discrète
│   — Aucune tâche                 │
├──────────────────────────────────┤
│   Mercredi 7 avril         (2)   │
│   ┌─ carte ───────────────────┐  │
│   ┌─ carte ───────────────────┐  │
├──────────────────────────────────┤
│ ...                              │
│                                  │
│ ▶ ✅ Terminées (3)               │
└──────────────────────────────────┘
```

### Fichiers modifiés

| Fichier | Action |
|---|---|
| `src/components/planning/WeekView.tsx` | Refonte esthétique de la vue semaine |

Aucune modification de logique ou de données — changements purement visuels.

