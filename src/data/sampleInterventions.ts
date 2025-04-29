
import { Intervention } from '@/types/Intervention';

// Sample interventions data
export const sampleInterventions: Intervention[] = [
  {
    id: 1,
    title: 'Réparation du moteur',
    equipment: 'Tracteur John Deere',
    equipmentId: 123,
    location: 'Champ principal',
    technician: 'Jean Dupont',
    date: new Date(2024, 5, 20),
    scheduledDuration: 8,
    priority: 'high',
    status: 'scheduled',
    description: 'Réparation complète du moteur suite à une surchauffe.',
    notes: 'Vérifier le système de refroidissement.',
    partsUsed: [{ partId: 1, name: 'Bougie', quantity: 4 }]
  },
  {
    id: 2,
    title: 'Maintenance préventive',
    equipment: 'Moissonneuse-batteuse Claas',
    equipmentId: 456,
    location: 'Hangar principal',
    technician: 'Sophie Martin',
    date: new Date(2024, 5, 22),
    scheduledDuration: 4,
    priority: 'medium',
    status: 'in-progress',
    description: 'Vérification et remplacement des filtres et huiles.',
    notes: 'Graisser tous les points de friction.',
    partsUsed: [{ partId: 2, name: 'Filtre à huile', quantity: 1 }]
  },
  {
    id: 3,
    title: 'Remplacement des pneus',
    equipment: 'Remorque agricole',
    equipmentId: 789,
    location: 'Atelier',
    technician: 'Pierre Leclerc',
    date: new Date(2024, 5, 25),
    scheduledDuration: 2,
    priority: 'low',
    status: 'completed',
    description: 'Remplacement des pneus usés par des neufs.',
    notes: 'Serrer les écrous de roue correctement.',
    partsUsed: [{ partId: 3, name: 'Pneu', quantity: 2 }],
    duration: 2
  },
  {
    id: 4,
    title: 'Diagnostic électrique',
    equipment: 'Tracteur New Holland',
    equipmentId: 101,
    location: 'Champ secondaire',
    technician: 'Jean Dupont',
    date: new Date(2024, 5, 28),
    scheduledDuration: 6,
    priority: 'medium',
    status: 'scheduled',
    description: 'Diagnostic et réparation du système électrique.',
    notes: 'Vérifier le câblage et les fusibles.',
    partsUsed: [{ partId: 4, name: 'Fusible 10A', quantity: 5 }]
  },
  {
    id: 5,
    title: 'Révision du système hydraulique',
    equipment: 'Ensileuse automotrice',
    equipmentId: 112,
    location: 'Hangar secondaire',
    technician: 'Sophie Martin',
    date: new Date(2024, 6, 1),
    scheduledDuration: 8,
    priority: 'high',
    status: 'scheduled',
    description: 'Révision complète du système hydraulique.',
    notes: 'Remplacer l\'huile hydraulique et vérifier les joints.',
    partsUsed: [{ partId: 5, name: 'Huile hydraulique', quantity: 20 }]
  }
];
