
# Schéma de la Base de Données (Supabase)

## Tables principales

### `equipment` - Équipements
| Colonne | Type | Description |
|---------|------|-------------|
| id | integer | Identifiant unique de l'équipement |
| name | text | Nom de l'équipement |
| model | text | Modèle de l'équipement |
| manufacturer | text | Fabricant |
| year | integer | Année de fabrication |
| serial_number | text | Numéro de série |
| purchase_date | timestamp | Date d'achat |
| location | text | Emplacement actuel |
| status | text | État (operational, maintenance, repair, inactive) |
| type | text | Type d'équipement |
| category | text | Catégorie |
| image | text | URL de l'image |
| notes | text | Notes diverses |
| owner_id | uuid | ID du propriétaire |
| farm_id | uuid | ID de l'exploitation |
| valeur_actuelle | numeric | Compteur d'usage actuel |
| unite_d_usure | text | Unité d'usure (heures, km, etc.) |
| last_wear_update | timestamp | Date de dernière mise à jour du compteur |

### `maintenance_tasks` - Tâches de maintenance
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint | Identifiant unique |
| title | text | Titre de la tâche |
| equipment | text | Nom de l'équipement |
| equipment_id | integer | ID de l'équipement |
| type | text | Type de maintenance |
| status | text | État (scheduled, in-progress, completed) |
| priority | text | Priorité (low, medium, high, critical) |
| due_date | timestamp | Date d'échéance |
| completed_date | timestamp | Date de réalisation |
| estimated_duration | numeric | Durée estimée |
| actual_duration | numeric | Durée réelle |
| assigned_to | text | Personne assignée |
| notes | text | Notes |
| owner_id | uuid | ID du propriétaire |

### `time_sessions` - Sessions de temps
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| user_id | uuid | ID de l'utilisateur |
| start_time | timestamp | Heure de début |
| end_time | timestamp | Heure de fin |
| status | text | État (active, paused, completed) |
| duration | numeric | Durée en heures |
| task_type | text | Type de tâche |
| custom_task_type | text | Type personnalisé |
| equipment_id | integer | ID de l'équipement |
| notes | text | Notes |
| location | text | Emplacement |
| journee_id | uuid | ID de journée de travail |

### `fuel_logs` - Registre carburant
| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | Identifiant unique |
| equipment_id | integer | ID de l'équipement |
| date | date | Date du ravitaillement |
| fuel_quantity_liters | double precision | Quantité de carburant (litres) |
| price_per_liter | double precision | Prix par litre |
| total_cost | double precision | Coût total |
| hours_at_fillup | double precision | Heures compteur lors du ravitaillement |
| notes | text | Notes diverses |
| farm_id | uuid | ID de l'exploitation |
| created_by | uuid | Créé par |

### `parts_inventory` - Inventaire pièces
| Colonne | Type | Description |
|---------|------|-------------|
| id | bigint | Identifiant unique |
| name | text | Nom de la pièce |
| part_number | text | Référence |
| quantity | integer | Quantité en stock |
| unit_price | numeric | Prix unitaire |
| supplier | text | Fournisseur |
| location | text | Emplacement de stockage |
| reorder_threshold | integer | Seuil de réapprovisionnement |
| category | text | Catégorie |
| compatible_with | array | Équipements compatibles |
| image_url | text | URL de l'image |
| owner_id | uuid | ID du propriétaire |
| farm_id | uuid | ID de l'exploitation |

## Relations et Sécurité

### Politiques de sécurité (RLS)
La sécurité au niveau des lignes (Row-Level Security) est implémentée pour:
- Restriction d'accès aux données par utilisateur/exploitation
- Protection des données sensibles
- Application du principe de moindre privilège

### Schéma de relations
```
profiles <- equipment -> maintenance_tasks
    ^           |
    |           v
    +--- time_sessions
    |
    +--- fuel_logs
    |
    +--- parts_inventory
```

## Fonctions clés

### `update_equipment_hours()`
Mise à jour automatique du compteur horaire des équipements après les sessions de temps.

### `calculate_fuel_total_cost()`
Calcul automatique du coût total de carburant.

### `get_equipment_statistics()`
Récupération des statistiques de maintenance pour un équipement.
