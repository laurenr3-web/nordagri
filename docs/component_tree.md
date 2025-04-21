
# Arborescence des Composants Principaux

## Structure Générale
```
src/
├── components/            # Composants réutilisables
│   ├── ui/                # Composants UI de base
│   ├── equipment/         # Gestion des équipements
│   ├── maintenance/       # Gestion de la maintenance
│   ├── time-tracking/     # Suivi du temps
│   ├── parts/             # Gestion des pièces détachées
│   ├── interventions/     # Interventions de terrain
│   ├── index/             # Composants de la page d'accueil
│   └── settings/          # Configuration de l'application
├── hooks/                 # Hooks personnalisés
├── services/              # Services d'intégration externe
├── data/                  # Couche de données
└── pages/                 # Pages de l'application
```

## Composants Principaux

### Équipements (`/components/equipment/`)
- **EquipmentForm** - Formulaire d'ajout/modification d'équipement
- **EquipmentDetails** - Affichage détaillé d'un équipement
- **EquipmentList** - Liste des équipements
- **EquipmentGrid** - Affichage en grille des équipements
- **EquipmentWearDisplay** - Affichage de l'usure des équipements

### Maintenance (`/components/maintenance/`)
- **MaintenanceContent** - Contenu principal de la maintenance
- **MaintenanceTable** - Liste des tâches de maintenance
- **NewTaskDialog** - Création de nouvelles tâches
- **MaintenanceFilters** - Filtres pour les tâches de maintenance
- **CalendarView** - Vue calendrier des tâches

### Suivi du temps (`/components/time-tracking/`)
- **TimeTracker** - Composant principal de suivi du temps
- **TimeEntryForm** - Formulaire d'enregistrement du temps
- **ActiveSessionsTable** - Tableau des sessions actives
- **TimeTrackingSummary** - Résumé du temps passé

### Pièces détachées (`/components/parts/`)
- **PartsGrid** - Affichage des pièces en grille
- **PartsList** - Liste des pièces
- **PartDetails** - Détails d'une pièce
- **AddPartForm** - Ajout de nouvelles pièces

### Interventions (`/components/interventions/`)
- **InterventionsContainer** - Conteneur principal des interventions
- **InterventionsList** - Liste des interventions
- **InterventionCard** - Carte d'intervention
- **InterventionDetailsDialog** - Détails d'une intervention

## Relations entre composants

```
Dashboard
├── StatsSection
├── EquipmentSection
├── MaintenanceSection
├── AlertsSection
└── TasksSection

Equipment
├── EquipmentHeader
├── EquipmentFilters
└── EquipmentContent
    ├── EquipmentGrid/List
    └── EquipmentDetails

Maintenance
├── MaintenanceHeader
├── MaintenanceFilters
└── MaintenanceContent
    ├── MaintenanceTable
    └── CalendarView
```
