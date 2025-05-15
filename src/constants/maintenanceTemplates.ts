
export type MaintenanceTemplateItem = {
  id: string;
  name: string;
  interval_type: 'hours' | 'months' | 'kilometers';
  interval: number;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
};

export type MaintenanceTemplate = {
  type: string;
  items: MaintenanceTemplateItem[];
};

export const maintenanceTemplates: MaintenanceTemplate[] = [
  {
    type: 'Tracteur',
    items: [
      {
        id: 'tractor-oil',
        name: 'Vidange moteur',
        interval_type: 'hours',
        interval: 250,
        category: 'Moteur',
        description: 'Remplacer l\'huile moteur et le filtre à huile',
        priority: 'high'
      },
      {
        id: 'tractor-air-filter',
        name: 'Remplacement filtre à air',
        interval_type: 'hours',
        interval: 500,
        category: 'Filtres',
        description: 'Remplacer le filtre à air primaire et secondaire',
        priority: 'medium'
      },
      {
        id: 'tractor-greasing',
        name: 'Graissage complet',
        interval_type: 'hours',
        interval: 50,
        category: 'Lubrification',
        description: 'Graisser tous les points de graissage du tracteur',
        priority: 'medium'
      },
      {
        id: 'tractor-hydraulic',
        name: 'Contrôle système hydraulique',
        interval_type: 'hours',
        interval: 1000,
        category: 'Hydraulique',
        description: 'Vérifier les niveaux et l\'état des fluides hydrauliques',
        priority: 'high'
      },
      {
        id: 'tractor-fuel-filter',
        name: 'Remplacement filtres à carburant',
        interval_type: 'hours',
        interval: 500,
        category: 'Filtres',
        description: 'Remplacer les filtres à carburant primaire et secondaire',
        priority: 'medium'
      }
    ]
  },
  {
    type: 'Moissonneuse',
    items: [
      {
        id: 'combine-oil',
        name: 'Vidange moteur',
        interval_type: 'hours',
        interval: 200,
        category: 'Moteur',
        description: 'Remplacer l\'huile moteur et le filtre à huile',
        priority: 'high'
      },
      {
        id: 'combine-radiator',
        name: 'Nettoyage radiateur',
        interval_type: 'hours',
        interval: 50,
        category: 'Refroidissement',
        description: 'Nettoyer le radiateur et les grilles de ventilation',
        priority: 'high'
      },
      {
        id: 'combine-belt',
        name: 'Contrôle des courroies',
        interval_type: 'hours',
        interval: 100,
        category: 'Transmission',
        description: 'Vérifier la tension et l\'état des courroies',
        priority: 'medium'
      },
      {
        id: 'combine-knife',
        name: 'Affûtage des couteaux',
        interval_type: 'hours',
        interval: 150,
        category: 'Coupe',
        description: 'Affûter ou remplacer les couteaux de la barre de coupe',
        priority: 'medium'
      },
      {
        id: 'combine-chain',
        name: 'Lubrification des chaînes',
        interval_type: 'hours',
        interval: 50,
        category: 'Lubrification',
        description: 'Lubrifier toutes les chaînes et pignons',
        priority: 'medium'
      }
    ]
  },
  {
    type: 'Pulvérisateur',
    items: [
      {
        id: 'sprayer-clean',
        name: 'Nettoyage circuit',
        interval_type: 'months',
        interval: 1,
        category: 'Nettoyage',
        description: 'Rincer et nettoyer le circuit de pulvérisation',
        priority: 'high'
      },
      {
        id: 'sprayer-nozzle',
        name: 'Contrôle des buses',
        interval_type: 'months',
        interval: 3,
        category: 'Pulvérisation',
        description: 'Vérifier l\'état et le débit des buses de pulvérisation',
        priority: 'high'
      },
      {
        id: 'sprayer-filter',
        name: 'Nettoyage des filtres',
        interval_type: 'months',
        interval: 1,
        category: 'Filtres',
        description: 'Nettoyer tous les filtres du circuit',
        priority: 'medium'
      },
      {
        id: 'sprayer-pump',
        name: 'Contrôle de la pompe',
        interval_type: 'months',
        interval: 6,
        category: 'Hydraulique',
        description: 'Vérifier le bon fonctionnement de la pompe',
        priority: 'medium'
      },
      {
        id: 'sprayer-calibration',
        name: 'Calibration',
        interval_type: 'months',
        interval: 6,
        category: 'Calibration',
        description: 'Calibrer le système de pulvérisation',
        priority: 'high'
      }
    ]
  }
];
