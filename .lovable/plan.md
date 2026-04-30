## Objectif

Réorganiser uniquement la navigation (sidebar desktop + menu mobile) en 3 sections thématiques claires, sans toucher au backend ni supprimer aucune fonctionnalité. Les routes existantes restent identiques.

## Structure cible des sections

```
TRAVAIL QUOTIDIEN     (priorité haute, en haut, contraste fort)
  • Dashboard           /dashboard
  • Planification       /planning
  • Points à surveiller /points

GESTION MATÉRIEL      (priorité moyenne)
  • Équipement          /equipment
  • Maintenance         /maintenance
  • Pièces              /parts

ANALYSE               (priorité basse, plus discret)
  • Suivi du temps      /time-tracking
  • Statistiques        /time-tracking/statistics

(Paramètres reste accessible en bas, séparé des 3 groupes)
```

## Changements proposés

### 1. Modèle de données nav partagé
Créer `src/components/layout/navConfig.ts` exportant un tableau de groupes :
```
[
  { id: 'daily',     labelKey: 'nav.group.daily',     items: [...] },
  { id: 'equipment', labelKey: 'nav.group.equipment', items: [...] },
  { id: 'analysis',  labelKey: 'nav.group.analysis',  items: [...] },
]
```
Chaque item : `{ path, icon, labelKey, priority: 'primary'|'secondary' }`.
Ajout de l'entrée Statistiques (route déjà existante `/time-tracking/statistics`, icône `BarChart3`).

Cela garantit la cohérence visuelle entre desktop et mobile (point 6).

### 2. Sidebar desktop — `src/components/layout/Navbar.tsx`
- Boucler sur les groupes de `navConfig`.
- Avant chaque groupe, afficher un titre de section : petit, uppercase, `text-xs font-semibold text-muted-foreground/70 tracking-wider px-3 mt-4 mb-2` (sauf le premier groupe : `mt-0`).
- Espacement clair entre groupes (`mt-6` entre groupes).
- Items du groupe « Travail quotidien » :
  - icône `h-5 w-5` (déjà), texte `font-medium`
  - actif: `bg-primary/10 text-primary` au lieu du `bg-secondary` standard pour renforcer le contraste (point 3).
- Items secondaires (Analyse) : `text-muted-foreground` un peu plus discret, icône `h-4 w-4` pour réduire le bruit (point 4).
- « Paramètres » sort des 3 groupes, reste en bas comme aujourd’hui (déjà séparé via `mt-auto` d'un autre conteneur, à conserver via un petit groupe « Compte » non titré ou simplement détaché en bas).

### 3. Menu mobile — `src/components/layout/MobileMenu.tsx`
La barre du bas actuelle utilise `ExpandableTabs` à plat (8 items). Pour passer à 3 sections claires sans casser le mobile-first :

Option retenue : **barre rapide + drawer**.
- Barre fixe en bas affiche uniquement les 3 items prioritaires (Dashboard, Planification, Points) + bouton « Plus » (icône `Menu`).
- Le bouton « Plus » ouvre un `Sheet` (bottom sheet) qui montre toutes les sections groupées avec titres :
  - TRAVAIL QUOTIDIEN, GESTION MATÉRIEL, ANALYSE, COMPTE (Paramètres)
  - Espacement clair (`space-y-6` entre groupes), grilles 2 colonnes pour les items, gros boutons accessibles au pouce (`h-14`, icône + label).
- La route active reste mise en évidence dans la barre rapide ET dans le drawer.
- Aucune route supprimée, tout reste atteignable.

Cela répond aux points 3 (priorité visuelle), 4 (réduire le bruit), 7 (mobile-first / accès au pouce) sans scroll horizontal (cf. règle projet : pas de scroll horizontal mobile).

### 4. Liens de navigation contextuels (point 5)
Ajouts ciblés, sans nouvelle logique métier :
- **Dashboard → Action** : sur le widget « Points à surveiller », ajouter un bouton « Créer une tâche » à côté de chaque item, qui navigue vers `/planning?fromPoint=<id>` (la page Planning ouvre déjà le dialog Nouvelle tâche via querystring — confirmer dans `Planning.tsx`, sinon préremplir via state `navigate(..., { state: { fromPoint } })`).
- **Point → Tâche** : dans `src/components/points/...` (carte/détail d’un point), ajouter un bouton « Créer une tâche » qui ouvre Planning préremplie avec le point lié.
- **Tâche → Point** : dans le dialog de détail d’une tâche de Planning, si la tâche est liée à un point (`linked_point_id` déjà géré côté DB via `usePointLinkedTasks`), afficher un bouton « Voir le point lié » qui navigue vers `/points?id=<id>`.
- **Dashboard → Action directe** : les cartes urgentes (Interventions urgentes, Stock faible, Maintenance due) doivent toutes être cliquables et amener directement à la fiche concernée — vérifier que c’est déjà le cas et ajouter `navigate` manquant si besoin.

Aucun changement de schéma DB. Uniquement des `Link` / `navigate` supplémentaires.

### 5. Traductions — `src/locales/fr.json` et `en.json`
Ajouter :
```
"nav.group.daily":     "Travail quotidien" / "Daily work"
"nav.group.equipment": "Gestion matériel"  / "Equipment"
"nav.group.analysis":  "Analyse"           / "Analysis"
"navbar.statistics":   "Statistiques"      / "Statistics"
"mobilemenu.statistics":"Stats"            / "Stats"
"mobilemenu.more":     "Plus"              / "More"
```

### 6. Cohérence visuelle (point 6)
- Mêmes icônes Lucide partout (déjà le cas, on garde les mêmes mappings dans `navConfig`).
- Espacement uniformisé : `gap-1` intra-groupe, `mt-6` inter-groupes.
- Pas de nouvelle palette : on reste sur `text-primary`, `text-muted-foreground`, `bg-primary/10`.

## Fichiers touchés

- **Nouveau** `src/components/layout/navConfig.ts`
- **Modifié** `src/components/layout/Navbar.tsx` (rendu groupé + titres de sections + accent prioritaire)
- **Modifié** `src/components/layout/MobileMenu.tsx` (barre rapide 3 items + bouton Plus + bottom sheet groupé)
- **Modifié** `src/locales/fr.json`, `src/locales/en.json` (clés de groupes + Statistiques + Plus)
- **Modifié** widgets dashboard (`src/components/dashboard/...`) et `src/components/points/...` pour les boutons contextuels « Créer une tâche » / « Voir le point lié »

## Hors périmètre (explicitement)

- Aucune modification des routes, des hooks, des services Supabase, des RLS, ou du schéma.
- Aucune suppression de page/fonctionnalité.
- Pas de redesign global : seules la navigation et quelques liens contextuels changent.

## Résultat attendu

Un utilisateur ouvre l’app et voit immédiatement 3 zones claires : *ce que je dois faire aujourd’hui*, *mon matériel*, *l’analyse*. Sur mobile, les 3 actions quotidiennes sont accessibles au pouce ; le reste est à un tap dans le bottom sheet. Les enchaînements Dashboard → Points → Planification deviennent des clics directs.
