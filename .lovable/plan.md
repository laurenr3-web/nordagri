
# Refonte visuelle dashboard mobile + raccourcis fonctionnels

Deux axes : (1) raffiner le visuel mobile pour ressembler à la maquette, (2) connecter les boutons du bottom sheet « Action rapide » aux vrais formulaires existants (au lieu d'URLs `?new=1` non écoutées).

---

## 1. Raccourcis « Action rapide » → formulaires réels

Aujourd'hui, `QuickActionBottomSheet` navigue vers `/planning?new=1`, `/points?new=1`, `/maintenance?new=1`, `/equipment?fuel=1`, `/equipment?scan=1`. **Aucune** de ces pages ne lit ces query params, donc il ne se passe rien après la navigation.

Approche : utiliser le pattern `CustomEvent` déjà en place dans le projet (`planning:n-task`, `n-equipment-dialog`). Pour chaque cible, naviguer puis dispatcher un évènement que la page écoute pour ouvrir son dialog.

### Évènements à utiliser / créer

| Action | Route cible | Évènement | État |
|---|---|---|---|
| Nouvelle tâche | `/planning` | `planning:n-task` | déjà écouté par `PlanningContent` |
| Point à surveiller | `/points` | `points:n-point` | **à ajouter** dans `PointsPage` |
| Maintenance | `/maintenance` | `maintenance:n-task` | **à ajouter** dans `useMaintenancePage` ou `Maintenance.tsx` |
| Plein carburant | `/equipment` | (navigation simple) | la page Equipment a son propre flux |
| Scanner QR | `/scan` | (navigation simple, page existe) | — |
| Équipements | `/equipment` | navigation simple | — |

### Logique dans `QuickActionBottomSheet`

```ts
const triggerAction = (path: string, eventName?: string) => {
  onOpenChange(false);
  navigate(path);
  if (eventName) {
    // attendre que la page cible monte ses listeners
    setTimeout(() => window.dispatchEvent(new CustomEvent(eventName)), 250);
  }
};
```

Les 6 boutons resteront identiques (mêmes icônes/labels) mais utiliseront cette fonction avec le bon évènement.

### Listeners à ajouter

- **`PointsPage.tsx`** : `useEffect` qui écoute `points:n-point` et appelle `setNewOpen(true)`.
- **`Maintenance.tsx`** (ou son hook `useMaintenancePage`) : écouter `maintenance:n-task` et appeler `setIsNewTaskDialogOpen(true)`.

---

## 2. Refonte visuelle mobile pour matcher la maquette

Référence : la photo fournie. Différences principales avec l'implémentation actuelle :

### a. Header (`DashboardHeader`)
- Afficher : logo ferme à gauche, **nom de la ferme** + sous-ligne « Synchronisé · Dimanche 3 mai », et avatar utilisateur à droite.
- Récupérer le nom de ferme via `useFarmId` (déjà charge `farms`) — exposer `farmName` si pas déjà fait.

### b. ContextBar (`DashboardContextBar`)
- Conserver 3 chips, mais style plus aéré : pill blanche bordée, icône à gauche, valeur + label sur une ligne (« 3 actifs »), chevron `›` à droite.
- 3e chip aujourd'hui = « stock bas » → la maquette montre « 4 points à surveiller ». **Remplacer** le chip stock par un compteur de points (open + watch), navigant vers `/points`. Le stock bas reste visible dans la version desktop.

### c. FirstActionCard
- Layout maquette : badge vert `★ À FAIRE EN PREMIER`, titre gras (« Vidange dépassée »), sous-titre métadonnées (« JD 6155R · +18h »), petite description, **vignette équipement carrée à droite** + pastille rouge `!` si critique.
- 3 actions en bas : bouton plein « Marquer fait », bouton outline « Ouvrir fiche », lien texte « Voir la priorité →ʼ ».
- L'image équipement vient de `equipment_photos` quand `source === 'maintenance'` ; fallback icône si absente. Récupérer via le `equipment_id` déjà présent dans le hook `useFirstAction` (à exposer dans le type `FirstAction`).
- Le bouton « Marquer fait » exécutera : maintenance → `update status=completed` ; planning → `update status=done` ; point → ouvrir dialog résolution. Réutiliser les mutations existantes (`usePlanningTasks` / hook maintenance déjà présent).

### d. WorkTodayCard
- Maquette : chaque ligne = pastille colorée carrée avec icône+label catégorie (« Maintenant », « Ensuite », « À surveiller »), titre, sous-titre, badge état à droite (« En cours », « À faire », « À revoir »).
- Conserver l'idée mais simplifier : les libellés `Maintenant / Ensuite / À surveiller` peuvent être dérivés de la priorité (`critical → Maintenant`, `important → Ensuite`, autre → À surveiller`). Limite 3 items.

### e. ActiveTeamCard
- Reprendre le format maquette : avatar 32px, nom gras, sous-titre « Intervention · Chargeur Volvo », et **durée chrono à droite** (ex. `2h15`) avec icône timer verte.
- Footer : ligne d'alerte « 2 tâches non assignées » + lien « Assigner → ».
- La durée de session est déjà calculable depuis `start_time` (cf. `formatDistanceToNowStrict`). Formatter en `XhYY`.

### f. Bottom nav (`MobileMenu`)
- Maquette montre 4 items + FAB central : Accueil, Planification, [+], Machines, Menu. Vérifier que `mobileQuickItems` correspond à ça (sinon ajuster l'ordre dans `navConfig`).

---

## 3. Fichiers touchés

**Modifiés**
- `src/components/dashboard/v2/QuickActionBottomSheet.tsx` — nouvelle logique navigate + dispatchEvent.
- `src/components/dashboard/v2/DashboardHeader.tsx` — nom de ferme, avatar, ligne sync.
- `src/components/dashboard/v2/DashboardContextBar.tsx` — chip points à la place de stock, style pill.
- `src/components/dashboard/v2/FirstActionCard.tsx` — layout maquette + vignette + 3 actions.
- `src/components/dashboard/v2/WorkTodayCard.tsx` — pastilles catégorie + badge état.
- `src/components/dashboard/v2/ActiveTeamCard.tsx` — chrono droit + footer assignations.
- `src/hooks/dashboard/v2/useFirstAction.ts` — exposer `equipmentId`, `equipmentPhotoUrl`.
- `src/hooks/dashboard/v2/useDashboardSignals.ts` — ajouter compteur `pointsToWatch`.
- `src/pages/Dashboard.tsx` — propager `farmName`, branchement signaux mis à jour.
- `src/components/points/PointsPage.tsx` — listener `points:n-point`.
- `src/pages/Maintenance.tsx` — listener `maintenance:n-task`.
- `src/hooks/useFarmId.ts` — exposer `farmName` si pas déjà.

**Aucune** nouvelle route, **aucune** migration DB, **aucune** RLS modifiée.

---

## 4. Validation

- Build TypeScript propre (auto).
- Chaque bouton du bottom sheet ouvre le bon dialog après navigation.
- Mobile 390px : pas de scroll horizontal, FAB lisible, dashboard fidèle à la maquette.
- Desktop ≥ lg : layout 2 colonnes inchangé.

