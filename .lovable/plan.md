## Objectif

Documenter la fonctionnalité de suivi du temps directement sur les tâches de Planification (Démarrer / Pause / Reprendre / Terminer + ligne compacte `Catégorie · Statut · ● 31 min`), **sans** ajouter d'icônes d'aide sur la carte mobile pour préserver l'allègement visuel.

## Décision UX

Les tooltips seront **créés** dans `tooltips.ts` (réutilisables ailleurs et utiles pour la cohérence du centre d'aide), mais **pas branchés** sur les boutons de `TaskTimeControls.tsx`. La pédagogie passe exclusivement par l'article du centre d'aide, accessible via le HelpFAB global et via la recherche.

## Fichiers et changements

### 1. Créer `src/components/help/articles/planning-task-time.md`

Article en français terrain, structure :

- **Pourquoi suivre le temps depuis une tâche ?** — 1 clic depuis la carte, pas besoin de basculer vers le module Temps, idéal pour les routines (traite, alimentation, contrôle).
- **Le cycle Démarrer → Pause → Reprendre → Terminer** :
  - Démarrer : ouvre une session liée à la tâche, le chrono court.
  - Pause : ferme la session active, le temps cumulé est conservé. La tâche reste à reprendre.
  - Reprendre : ouvre une nouvelle session sur la même tâche, le temps s'**additionne** au précédent.
  - Terminer : marque la **tâche** comme faite. Si une session est encore active, elle est arrêtée automatiquement.
- **Lire la ligne compacte** : `Alimentation · En cours · ● 31 min` — catégorie, statut, point pulsant + temps cumulé. Le point vert indique une session **active**.
- **Plusieurs sessions sur une même tâche** : tâches étalées (matin / soir, avant-pause / après-pause). Le total affiché est la somme de toutes les sessions.
- **3 bonnes pratiques terrain** :
  1. Démarre dès que tu mets le pied dans la tâche, pas après.
  2. Pause à chaque interruption réelle (appel, autre urgence) — c'est ce qui rend le total fiable.
  3. Termine la tâche seulement quand elle est vraiment faite ; une session active sera coupée toute seule.

### 2. Mettre à jour `src/components/help/articles/index.ts`

- Importer `planningTaskTime from './planning-task-time.md?raw'`.
- Ajouter une entrée `planning-task-time` :
  - `category: 'planning'`, `readTime: 3`
  - `keywords: ['chrono','session','pause','reprendre','terminer','temps','planning','tâche']`
  - `tags: ['Planning', 'Temps', 'Mobile']`

### 3. Compléter `src/components/help/articles/daily-planning.md`

Ajouter une courte section (4-6 lignes) "Suivre le temps directement sur une tâche" avec un renvoi naturel vers le nouvel article ("Voir l'article dédié au chrono par tâche"). Pas de duplication du contenu détaillé.

### 4. Étendre `src/content/help/tooltips.ts`

Ajouter 4 entrées, toutes avec `articleId: 'planning-task-time'`, typées via le `satisfies Record<string, TooltipContent>` existant :

- `planning.time.start` — *Démarrer* : "Lance une session de temps liée à cette tâche."
- `planning.time.pause` — *Pause* : "Arrête la session en cours et conserve le temps cumulé. Tu peux reprendre plus tard."
- `planning.time.resume` — *Reprendre* : "Démarre une nouvelle session sur la même tâche. Le temps s'additionne au précédent."
- `planning.time.finishTask` — *Terminer* : "Marque la tâche comme faite. Si une session est active, elle est arrêtée automatiquement."

Ces clés restent disponibles pour de futurs emplacements (ex. dialog plein écran, écran d'onboarding) sans imposer de surcharge visuelle sur la carte.

### 5. `src/components/planning/TaskTimeControls.tsx`

**Aucun changement.** Pas d'ajout de `HelpTooltip`, pas de wrapper supplémentaire — la carte reste compacte.

## Contraintes respectées

- Aucune modification de logique métier (mutations, hooks, stats inchangés).
- Aucun changement DB.
- Aucun nouveau package.
- Aucun `any`.
- Carte de tâche mobile **non alourdie** (pas d'icône `?` à côté des boutons).
- Français terrain agricole conservé.

## Vérifications post-implémentation

- L'article apparaît dans la catégorie Planning du centre d'aide.
- La recherche par "chrono", "pause", "reprendre", "session" remonte le nouvel article.
- Les 4 clés tooltip sont enregistrées (vérifiables côté types) sans s'afficher actuellement nulle part.
- Aucune régression visuelle sur les cartes de tâches Planification.
