## Étape 1 (delta) — Audit Planning + Suivi de temps

Le brief inclut désormais Planning et Suivi de temps, et **retire** « Nouvelle intervention ». L'audit des 4 formulaires précédents (Équipement / Maintenance / Point / Pièce) reste valide. Voici uniquement l'ajout.

Légende : 🟢 SKIP · 🟡 N1 (tooltip court) · 🔴 N3 (tooltip + article)

Tooltips déjà existants potentiellement réutilisables :
- `planning.recurring`, `planning.swipe`
- `time.session`
- `roles.hierarchy`

---

## Formulaire 5 — Nouvelle tâche de planification

**Composant :** `src/components/planning/AddTaskForm.tsx` (sert aussi pour l'édition)
- Lib : state local (`useState`), pas de RHF
- Labels : `<Label>` shadcn classique
- Validation : `title.trim()` requis (bouton désactivé sinon)
- Layout : Dialog avec section principale + section repliable « Plus d'options »

### Section principale (toujours visible)

| Champ (label exact) | Type | Catégorie | Justification |
|---|---|---|---|
| Titre * | text | 🟢 SKIP | Auto-explicatif (placeholder « Ex: Nourrir les vaches ») |
| Date | 3 boutons (Aujourd'hui / Demain / Choisir) + date picker | 🟢 SKIP | Auto-explicatif |
| Catégorie | grille 7 boutons (animaux/champs/alimentation/equipement/batiment/administration/autre) | 🔴 N3 | Concept clé : pilote la priorité auto via réglages ferme |
| Assignée à | select membres équipe | 🟢 SKIP | Auto-explicatif |

### Section « Plus d'options » (repliée)

| Champ (label exact) | Type | Catégorie | Justification |
|---|---|---|---|
| Récurrence | select (Aucune / Tous les jours / Chaque semaine / Certains jours) | 🔴 N3 | **Réutiliser `planning.recurring` existant** |
| Jours de la semaine | toggles 7 jours (visible si Certains jours) | 🟡 N1 | Sélection multiple, on peut cocher plusieurs jours |
| Note | textarea | 🟢 SKIP | Auto-explicatif |
| Priorité manuelle | select (Automatique / Critique / Important / À faire) | 🔴 N3 | Concept métier : override la priorité auto de la catégorie |
| Équipement | select | 🟡 N1 | Lier la tâche à un équipement de la flotte |
| Champ agricole | text | 🟡 N1 | Champ libre, ex : Champ Nord |
| Bâtiment | text | 🟡 N1 | Champ libre, ex : Étable principale |
| Groupe d'animaux | text | 🟡 N1 | Champ libre, ex : Vaches laitières |

**Tooltips à créer (5 nouveaux) :** `planning.field.category` (N3), `planning.field.recurrenceDays` (N1), `planning.field.manualPriority` (N3), `planning.field.equipment` (N1), `planning.field.fieldName` (N1), `planning.field.buildingName` (N1), `planning.field.animalGroup` (N1) → soit **7 nouvelles**.
**Tooltips à réutiliser (1) :** `planning.recurring` sur le label « Récurrence ».

⚠️ **Cas particulier mobile** : la grille 7 catégories est dense en 375px ; le tooltip se place sur le **label « Catégorie »** (pas sur chaque bouton). Idem pour Récurrence et Priorité manuelle.

---

## Formulaire 6 — Détails / édition de tâche planning

**Composant :** `src/components/planning/TaskDetailDialog.tsx`
- Pas un « formulaire » classique mais un dialog d'édition rapide avec plusieurs zones
- Champs interactifs : Assignée à (select), Reporter à (3 boutons + calendrier), boutons d'action de statut

| Élément (label exact) | Type | Catégorie | Justification |
|---|---|---|---|
| Statut (badge) | affichage seul | 🟢 SKIP | Lecture seule, pas un champ |
| Priorité (badge) | affichage seul | 🟢 SKIP | Lecture seule |
| Assignée à | select | 🟢 SKIP | Identique au formulaire principal, déjà couvert |
| Boutons Commencer / Terminer / Bloqué / Débloquer | actions | 🔴 N3 | Concept clé : cycle de vie d'une tâche (todo → in_progress → done, ou blocked) — placer le tooltip sur le titre **« Actions »** |
| Reporter à (Aujourd'hui / Demain / Choisir) | actions | 🟡 N1 | Pourquoi reporter une tâche, conséquences sur la récurrence — tooltip sur le titre **« Reporter à »** |

**Tooltips à créer (2 nouveaux) :** `planning.field.statusActions` (N3, sur le titre « Actions »), `planning.field.postpone` (N1, sur le label « Reporter à »).

⚠️ **Note** : « Modifier » réouvre `AddTaskForm` (déjà couvert), pas besoin de tooltip dédié.

---

## Formulaire 7 — Réglages des priorités par catégorie (Planning)

**Composant :** `src/components/settings/farm/CategoryImportanceSection.tsx`
- Pas un formulaire à soumettre : modifications appliquées immédiatement (mutation directe)
- 7 lignes catégorie × 3 boutons priorité (Critique / Important / À faire)

| Élément (label exact) | Type | Catégorie | Justification |
|---|---|---|---|
| Titre de la section « Priorité par catégorie » | titre | 🔴 N3 | Concept central : pilote la priorité auto de toutes les nouvelles tâches → tooltip sur le titre de la section |

**Tooltips à créer (1 nouveau) :** `planning.field.categoryDefaultPriority` (N3, à brancher sur l'icône `Tag` ou à côté du titre via `SettingsSectionWrapper`).

⚠️ **Vérification d'intégration** : Le titre est rendu par `SettingsSectionWrapper` (pas inspecté en détail ici) — il faudra confirmer s'il accepte un slot ou si on doit poser le tooltip à l'intérieur du `children`. À traiter à l'Étape 4.

---

## Formulaire 8 — Démarrer une session de suivi de temps

**Composant :** `src/components/time-tracking/TimeEntryForm.tsx`
- Lib : state local (`useState`)
- Labels : `<Label>` shadcn (avec emojis dans certains labels)
- Validation : équipement OU poste de travail requis ; titre requis ; type custom requis si type=other
- Layout : Sheet (mobile) ou Dialog (desktop)

| Champ (label exact) | Type | Catégorie | Justification |
|---|---|---|---|
| Type de tâche (TaskTypeField) | select avec custom | 🔴 N3 | Concept métier qui catégorise toute la session — couvre maintenance / réparation / autre |
| 🧾 Titre de la session * | text | 🟡 N1 | Court descriptif : utilisé dans rapports et facturation |
| Équipement (EquipmentField) | select | 🔴 N3 | **Réutiliser `time.session` existant** sur le label général de session, mais ici N3 dédié : alternative au poste de travail |
| Poste de travail (WorkstationField) | text | 🔴 N3 | Alternative à équipement : pour travaux non liés à la flotte (ex: atelier, champ) |
| Lieu (LocationField) | select | 🟡 N1 | Localisation physique, sert au suivi terrain |
| Intervention liée (InterventionField) | select | 🟢 SKIP | Désactivé tant qu'aucun équipement choisi — auto-explicatif (le module interventions étant retiré, ce champ pourrait disparaître à terme mais reste pour rétrocompatibilité avec données existantes) |
| 🗒️ Notes / Observations | textarea | 🟢 SKIP | Auto-explicatif |
| ℹ️ Description | textarea | 🟡 N1 | Distinguer Notes (terrain) vs Description (contexte général) |

**Tooltips à créer (5 nouveaux) :** `time.field.taskType` (N3), `time.field.title` (N1), `time.field.equipment` (N3), `time.field.workstation` (N3), `time.field.location` (N1), `time.field.description` (N1) → soit **6 nouvelles**.
**Tooltips à réutiliser (0 directement)** : `time.session` reste utilisable ailleurs (bouton de démarrage) mais ici on cible des champs spécifiques.

⚠️ **Question doublon Notes/Description** : les deux champs se ressemblent. Le tooltip sur Description doit clarifier la différence. Si tu préfères on peut N1 sur Notes aussi pour symétrie.

⚠️ **Champ Intervention** : marqué SKIP car le module Interventions est retiré du brief. **À valider** : si tu veux qu'on retire ce champ du formulaire, c'est une modif logique métier — hors périmètre actuel. L'aide ne le couvre pas.

---

## Formulaire 9 — Clôturer / éditer une session de temps

**Composant principal :** `src/components/time-tracking/detail/closure/SessionClosure.tsx` (orchestrateur)
**Sous-composant pertinent :** `src/components/time-tracking/detail/closure/QuickEditSection.tsx`

Sections détectées (orchestrateur) : Summary, QuickEdit, SmartActions, Attachments, Export.

### Champs éditables (QuickEditSection)

| Champ (label exact) | Type | Catégorie | Justification |
|---|---|---|---|
| Notes finales | textarea | 🟡 N1 | Différent des notes en cours de session : bilan final |
| Matériel utilisé | select (filter/oil/parts) | 🟡 N1 | Liste limitée, sert au calcul de coût |
| Quantité | number | 🟢 SKIP | Auto-explicatif (associé au matériel) |

**Tooltips à créer (2 nouveaux) :** `time.field.finalNotes` (N1), `time.field.material` (N1).

⚠️ **Limite de l'audit** : je n'ai pas inspecté `SmartActionsSection`, `SummarySection`, `AttachmentsSection`, `ExportSection`. Si tu veux une couverture exhaustive de la clôture, je dois les lire en plus. Vu leur nature (résumé, actions automatiques, pièces jointes, export), je pense qu'elles relèvent plus de boutons d'action / résumés que de champs de saisie → probablement majoritairement SKIP. **À valider** : on s'arrête à QuickEdit, ou je creuse les 4 autres ?

---

## Formulaire 10 — Saisie manuelle d'une entrée de temps

**Constat :** Aucun formulaire dédié n'existe dans le code. La recherche `rg "manual|saisie manuelle"` ne remonte rien de pertinent. Le seul point d'entrée pour créer un time entry est `TimeEntryForm` (qui démarre une session live).

**Décision :** Hors périmètre — pas de formulaire à documenter. **À confirmer** : tu confirmes qu'il n'existe pas de saisie a posteriori côté code, ou tu veux qu'on en ajoute la création (hors scope « aide ») ?

---

## Récapitulatif global étendu (Étape 1 + delta)

| # | Formulaire | Nouvelles clés | Réutilisées | Article ? |
|---|---|---|---|---|
| 1 | Équipement | 6 | 2 | how-to-create-equipment |
| 2 | Maintenance (NewTaskDialog) | 3 | 2 | how-to-create-maintenance |
| 3 | Point à surveiller | 3 | 0 | how-to-create-point |
| 4 | Pièce détachée | 4 | 2 | how-to-create-part |
| 5 | Planning — AddTaskForm | 7 | 1 | how-to-create-planning-task |
| 6 | Planning — TaskDetailDialog | 2 | 0 | (couvert par article #5) |
| 7 | Planning — Réglages priorités | 1 | 0 | (couvert par article #5) |
| 8 | Time — TimeEntryForm | 6 | 0 | how-to-track-time |
| 9 | Time — QuickEdit clôture | 2 | 0 | (couvert par article #8) |
| **TOTAL** | | **~34 nouvelles clés** | **7 réutilisées** | **6 articles** |

Articles à créer en Étape 3 (mise à jour) :
- `how-to-create-equipment`
- `how-to-create-maintenance`
- `how-to-create-point`
- `how-to-create-part`
- **`how-to-create-planning-task`** (nouveau)
- **`how-to-track-time`** (nouveau, couvre démarrage + clôture)

---

## Points d'ambiguïté à valider avant Étape 2

1. **Maintenance** : on cible bien `NewTaskDialog` (page Maintenance) et pas `MaintenancePlanForm` ?
2. **TaskDetailDialog** : OK pour limiter aux 2 tooltips identifiés (Actions + Reporter) et pas tagger chaque bouton ?
3. **Réglages priorités** : OK de poser le tooltip sur le titre via `SettingsSectionWrapper` ? Si le wrapper ne le permet pas proprement, on pose le tooltip à côté du paragraphe d'aide en bas (« 💡 Les modifications… »).
4. **Suivi de temps clôture** : on couvre **uniquement QuickEdit** ou je creuse Summary/SmartActions/Attachments/Export ?
5. **TimeEntryForm — champ Intervention** : SKIP côté aide, mais veux-tu qu'à terme le champ soit retiré (changement logique, hors scope actuel) ?
6. **Saisie manuelle de temps** : confirmé que ce formulaire n'existe pas → on l'ignore ?
7. **Total ~34 clés** : ça reste raisonnable. Mais 6 articles à rédiger = ~3000-4200 mots. OK pour rédiger les 6, ou on commence par 4 et on ajoute Planning/Time en V2 ?

**STOP — j'attends tes réponses pour passer à l'Étape 2 (rédaction des tooltips).**