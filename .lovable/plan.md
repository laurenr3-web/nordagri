

# Plan — Suggestions de maintenance dans le module Planification

## Vue d'ensemble

Intégrer une section "Maintenances dues" dans la vue Aujourd'hui qui affiche les maintenances en retard ou dues, avec un bouton pour créer une tâche de planification. La section est masquée si aucune suggestion actionnable n'existe.

## 1. Migration SQL

Ajouter `source_module` et `source_id` à `planning_tasks` :

```sql
ALTER TABLE public.planning_tasks
  ADD COLUMN source_module text DEFAULT NULL,
  ADD COLUMN source_id text DEFAULT NULL;
```

## 2. Fichiers modifiés/créés

| Fichier | Action |
|---|---|
| Migration SQL | `source_module`, `source_id` sur `planning_tasks` |
| `src/hooks/planning/useMaintenanceSuggestions.ts` | **Nouveau** — hook qui fetch les maintenances dues et expose `createTaskFromMaintenance` |
| `src/components/planning/MaintenanceSuggestions.tsx` | **Nouveau** — composant UI de la section suggestions |
| `src/components/planning/DayView.tsx` | Intégrer `MaintenanceSuggestions` entre "En retard" et les tâches, uniquement si `isToday` |
| `src/services/planning/planningService.ts` | Ajouter `source_module`/`source_id` au type `PlanningTask` et aux params de `addTask` |

## 3. Hook `useMaintenanceSuggestions`

- Query `maintenance_tasks` avec jointure `equipment_ref:equipment_id(valeur_actuelle, farm_id, name)`, filtrée par `equipment.farm_id = farmId`
- Filtre : `status NOT IN ('completed', 'cancelled')`
- Détection "due" :
  - Date-based (`trigger_unit` = 'none'/null) : `due_date <= today`
  - Counter-based : `equipment.valeur_actuelle >= trigger_hours` ou `trigger_kilometers`
- Anti-doublon : query `planning_tasks` avec `source_module = 'maintenance'` et `status IN ('todo', 'in_progress', 'blocked')` → set de `source_id` déjà planifiés
- Chaque suggestion retourne : titre, nom équipement, `isOverdue`, `daysLate`, `alreadyPlanned`, info compteur
- Mutation `createTaskFromMaintenance` :
  - Priorité : en retard → `critical`, due aujourd'hui → `important`
  - Notes préremplies : "Maintenance : {titre} — Équipement : {nom}. {détail compteur ou date}"
  - `source_module = 'maintenance'`, `source_id = String(maintenance.id)`
  - Invalide queries `planningTasks`, `maintenanceSuggestions`, `planningOverdue`

## 4. Composant `MaintenanceSuggestions`

- **Masquage complet** si aucune maintenance due
- **Masquage complet** si toutes les suggestions ont `alreadyPlanned = true` (pas de section visible, zéro bruit)
- Si certaines sont planifiées et d'autres non : afficher uniquement les non-planifiées
- Section avec icône 🔧 et titre "Maintenances dues"
- Cartes avec bordure amber :
  - Badge : "En retard de X jours" ou "Due aujourd'hui" ou "Seuil d'entretien dépassé"
  - Bouton "Créer une tâche"
- Style distinct des tâches normales

## 5. Intégration DayView

- Afficher `MaintenanceSuggestions` entre la section "En retard" et les tâches normales, uniquement quand `isToday = true`
- Passer `farmId` et le user courant

## 6. Mise à jour planningService

- Ajouter `source_module?: string | null` et `source_id?: string | null` au type `PlanningTask` et aux params de `addTask`

