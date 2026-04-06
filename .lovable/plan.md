

# Plan — Donner accès aux données de ferme pour les membres invités

## Problème racine

L'équipement existant a `farm_id = NULL`. La politique RLS de la table `equipment` autorise les membres de ferme uniquement si `farm_id IS NOT NULL AND is_farm_member(farm_id)`. Comme `farm_id` est null, seul le propriétaire (`owner_id`) voit les données.

C'est le même problème pour les données liées : interventions, maintenance_tasks, parts_inventory, fuel_logs — beaucoup reposent sur `farm_id` ou `equipment.farm_id` pour la visibilité multi-utilisateur.

De plus, `teamService.ts` requête `profiles.email` qui n'existe pas dans la table.

## Changements prévus

### 1. Migration : associer les équipements existants à leur ferme
- Mettre à jour tous les équipements dont `farm_id IS NULL` pour leur attribuer la ferme du propriétaire (via `farms.owner_id`)
- Idem pour `parts_inventory`, `fuel_logs`, `interventions`, `maintenance_tasks`, `maintenance_plans` dont `farm_id` est null ou manquant

```sql
-- Associer equipment à la ferme du propriétaire
UPDATE equipment e
SET farm_id = f.id
FROM farms f
WHERE e.owner_id = f.owner_id AND e.farm_id IS NULL;

-- Associer parts_inventory
UPDATE parts_inventory p
SET farm_id = f.id
FROM farms f
WHERE p.owner_id = f.owner_id AND p.farm_id IS NULL;

-- Associer fuel_logs (via equipment)
UPDATE fuel_logs fl
SET farm_id = e.farm_id
FROM equipment e
WHERE fl.equipment_id = e.id AND fl.farm_id IS NULL AND e.farm_id IS NOT NULL;
```

### 2. Migration : ajouter `farm_id` aux tables qui en manquent
- `maintenance_plans` n'a pas de `farm_id`. Ajouter la colonne et la peupler depuis l'équipement associé ou le propriétaire.
- Mettre à jour la politique RLS de `maintenance_plans` pour supporter `is_farm_member`

### 3. Corriger `owns_equipment` pour supporter les membres de ferme
- Modifier la fonction pour vérifier aussi `is_farm_member(farm_id)` en plus de `owner_id = auth.uid()`
- Cela corrige automatiquement l'accès aux tables `equipment_logs`, `equipment_photos`, `equipment_maintenance_schedule`, `equipment_qrcodes`

### 4. Corriger `teamService.ts` — supprimer la référence à `profiles.email`
- La table `profiles` n'a pas de colonne `email`
- Remplacer les requêtes qui sélectionnent `email` par `id, first_name, last_name, farm_id` uniquement
- Récupérer l'email depuis la session auth si nécessaire

### 5. Mettre à jour les RLS de `maintenance_plans` pour les membres de ferme
- Ajouter une politique SELECT qui vérifie `is_farm_member` via le nouveau `farm_id`

## Fichiers modifiés

| Fichier | Changement |
|---|---|
| Migration SQL | Associer données existantes aux fermes + ajouter `farm_id` à `maintenance_plans` |
| Migration SQL | Modifier `owns_equipment` pour supporter farm members |
| Migration SQL | Nouvelles RLS pour `maintenance_plans` |
| `src/services/teamService.ts` | Supprimer `email` des requêtes profiles |

## Impact
- Les membres invités verront immédiatement les équipements, interventions, pièces et maintenances de la ferme
- Les futurs ajouts d'équipement devront toujours inclure `farm_id`

