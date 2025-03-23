
import { Activity, Equipment } from './types';

// Mock equipment data
export const getMockEquipments = (): Equipment[] => [
  { id: 1, name: 'John Deere 8R 410', type: 'Tractor', status: 'available' },
  { id: 2, name: 'Case IH Axial-Flow', type: 'Harvester', status: 'available' },
  { id: 3, name: 'Kubota M7-172', type: 'Tractor', status: 'available' },
  { id: 4, name: 'Massey Ferguson 8S.245', type: 'Tractor', status: 'maintenance' },
  { id: 5, name: 'New Holland T6.180', type: 'Tractor', status: 'available' },
  { id: 6, name: 'Fendt 942 Vario', type: 'Tractor', status: 'in-use' },
];

// Mock initial activities
export const getInitialActivities = (): Activity[] => [
  {
    id: 1,
    taskName: 'Plowing North Field',
    equipmentId: 1,
    equipment: 'John Deere 8R 410',
    fieldId: 1,
    field: 'North Field',
    fieldSize: 25,
    status: 'pending',
    duration: 0,
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    location: { lat: 48.874716, lng: 2.359014 },
    coordinates: { lat: 48.874716, lng: 2.359014 }, // Keep for backward compatibility
    description: 'Plowing North Field',
    notes: 'Prepare field for spring planting'
  },
  {
    id: 2,
    taskName: 'Harvesting South Field',
    equipmentId: 2,
    equipment: 'Case IH Axial-Flow',
    fieldId: 2,
    field: 'South Field',
    fieldSize: 18,
    status: 'completed',
    duration: 5.5 * 3600, // 5.5 hours in seconds
    createdAt: new Date(Date.now() - 86400000), // 1 day ago
    location: { lat: 48.854716, lng: 2.339014 },
    coordinates: { lat: 48.854716, lng: 2.339014 }, // Keep for backward compatibility
    description: 'Harvesting South Field',
    notes: 'Completed harvesting winter wheat'
  }
];
