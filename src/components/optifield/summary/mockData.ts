
import { EquipmentUsage, FieldUsage } from './types';

export const MOCK_EQUIPMENT: EquipmentUsage[] = [
  {
    id: '1',
    name: 'Tracteur John Deere 6250R',
    hoursToday: 3.5,
    hoursWeek: 27.5,
    hoursTotal: 1245,
    efficiency: 87,
    maintenanceStatus: 'good'
  },
  {
    id: '2',
    name: 'Tracteur New Holland T7',
    hoursToday: 0,
    hoursWeek: 15.2,
    hoursTotal: 895,
    efficiency: 78,
    maintenanceStatus: 'warning'
  },
  {
    id: '3',
    name: 'Moissonneuse Claas Lexion',
    hoursToday: 0,
    hoursWeek: 0,
    hoursTotal: 456,
    efficiency: 91,
    maintenanceStatus: 'critical'
  }
];

export const MOCK_FIELDS: FieldUsage[] = [
  {
    id: '1',
    name: 'Les Grandes Terres',
    area: '15.3 ha',
    hoursWorked: 12.5,
    lastOperation: 'Labour',
    progress: 65
  },
  {
    id: '2',
    name: 'Parcelle Nord',
    area: '8.7 ha',
    hoursWorked: 8.2,
    lastOperation: 'Semis',
    progress: 100
  },
  {
    id: '3',
    name: 'Parcelle Sud',
    area: '10.2 ha',
    hoursWorked: 0,
    lastOperation: 'Aucune',
    progress: 0
  }
];
