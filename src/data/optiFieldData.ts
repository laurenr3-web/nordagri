
import { Field, Equipment, TrackingSession, ActivityType, ActivitySummary } from '@/types/OptiField';

// Mock fields data
export const mockFields: Field[] = [
  {
    id: 'field1',
    name: 'Les Grandes Terres',
    area: 15.3,
    boundaries: [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8566, lng: 2.3622 },
      { lat: 48.8666, lng: 2.3622 },
      { lat: 48.8666, lng: 2.3522 },
    ]
  },
  {
    id: 'field2',
    name: 'Parcelle Nord',
    area: 8.7,
    boundaries: [
      { lat: 48.8766, lng: 2.3522 },
      { lat: 48.8766, lng: 2.3622 },
      { lat: 48.8866, lng: 2.3622 },
      { lat: 48.8866, lng: 2.3522 },
    ]
  },
  {
    id: 'field3',
    name: 'Parcelle Sud',
    area: 10.2,
    boundaries: [
      { lat: 48.8366, lng: 2.3522 },
      { lat: 48.8366, lng: 2.3622 },
      { lat: 48.8466, lng: 2.3622 },
      { lat: 48.8466, lng: 2.3522 },
    ]
  }
];

// Mock equipment data
export const mockEquipment: Equipment[] = [
  {
    id: 'equip1',
    name: 'Tracteur John Deere 6250R',
    type: 'tractor',
    status: 'active',
    currentLocation: { lat: 48.8566, lng: 2.3522 },
    currentField: 'field1'
  },
  {
    id: 'equip2',
    name: 'Tracteur New Holland T7',
    type: 'tractor',
    status: 'inactive'
  },
  {
    id: 'equip3',
    name: 'Moissonneuse Claas Lexion',
    type: 'harvester',
    status: 'maintenance'
  },
  {
    id: 'equip4',
    name: 'Charrue Kverneland',
    type: 'implement',
    status: 'active'
  },
  {
    id: 'equip5',
    name: 'Semoir Amazone',
    type: 'implement',
    status: 'inactive'
  }
];

// Mock tracking sessions
export const mockTrackingSessions: TrackingSession[] = [
  {
    id: 'session1',
    equipmentPairingId: 'pairing1',
    fieldId: 'field1',
    activityType: 'plowing',
    startTime: new Date(2023, 4, 15, 8, 0),
    endTime: new Date(2023, 4, 15, 12, 30),
    path: [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8576, lng: 2.3532 },
      { lat: 48.8586, lng: 2.3542 }
    ],
    status: 'completed',
    totalDuration: 270, // 4.5 hours in minutes
    productiveTime: 245 // Productive time in minutes
  },
  {
    id: 'session2',
    equipmentPairingId: 'pairing2',
    fieldId: 'field2',
    activityType: 'seeding',
    startTime: new Date(2023, 4, 16, 7, 30),
    endTime: new Date(2023, 4, 16, 16, 0),
    path: [
      { lat: 48.8766, lng: 2.3522 },
      { lat: 48.8776, lng: 2.3532 },
      { lat: 48.8786, lng: 2.3542 }
    ],
    status: 'completed',
    totalDuration: 510, // 8.5 hours in minutes
    productiveTime: 480 // Productive time in minutes
  },
  {
    id: 'session3',
    equipmentPairingId: 'pairing1',
    fieldId: 'field1',
    activityType: 'plowing',
    startTime: new Date(),
    path: [
      { lat: 48.8566, lng: 2.3522 },
      { lat: 48.8576, lng: 2.3532 }
    ],
    status: 'active',
    totalDuration: 120, // 2 hours in minutes so far
    productiveTime: 110 // Productive time in minutes
  }
];

// Activity types with French translations
export const activityTypeLabels: Record<ActivityType, string> = {
  plowing: 'Labour',
  harrowing: 'Hersage',
  seeding: 'Semis',
  fertilizing: 'Fertilisation',
  spraying: 'Pulvérisation',
  harvesting: 'Récolte',
  transport: 'Transport',
  maintenance: 'Entretien',
  other: 'Autre'
};

// Generate activity summaries
export const generateActivitySummaries = (): ActivitySummary[] => {
  return [
    {
      equipmentName: 'Tracteur John Deere 6250R avec Charrue Kverneland',
      fieldName: 'Les Grandes Terres',
      activityType: 'plowing',
      duration: 270, // 4.5 hours in minutes
      date: new Date(2023, 4, 15),
      efficiency: 87
    },
    {
      equipmentName: 'Tracteur New Holland T7 avec Semoir Amazone',
      fieldName: 'Parcelle Nord',
      activityType: 'seeding',
      duration: 510, // 8.5 hours in minutes
      date: new Date(2023, 4, 16),
      efficiency: 78
    },
    {
      equipmentName: 'Tracteur John Deere 6250R',
      fieldName: 'Parcelle Sud',
      activityType: 'transport',
      duration: 45, // 45 minutes
      date: new Date(2023, 4, 17),
      efficiency: 95
    }
  ];
};

// Helper function to format duration
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}min`;
  }
};

// Helper to get activity type label
export const getActivityTypeLabel = (type?: ActivityType): string => {
  if (!type) return 'Non spécifié';
  return activityTypeLabels[type] || 'Non spécifié';
};
