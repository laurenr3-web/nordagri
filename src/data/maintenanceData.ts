
import { MaintenanceTask, MaintenanceType, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';

// Sample maintenance tasks
export const maintenanceTasks: MaintenanceTask[] = [
  {
    id: 1,
    title: 'Oil and Filter Change',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    type: 'preventive' as MaintenanceType,
    status: 'scheduled' as MaintenanceStatus,
    priority: 'medium' as MaintenancePriority,
    dueDate: new Date(2023, 5, 15),
    engineHours: 2,
    assignedTo: 'Michael Torres',
    notes: 'Use synthetic oil as specified in manual. Check fuel filters as well.'
  },
  {
    id: 2,
    title: 'Hydraulic System Inspection',
    equipment: 'Case IH Axial-Flow',
    equipmentId: 2,
    type: 'preventive' as MaintenanceType,
    status: 'in-progress' as MaintenanceStatus,
    priority: 'high' as MaintenancePriority,
    dueDate: new Date(2023, 5, 12),
    engineHours: 3,
    assignedTo: 'David Chen',
    notes: 'Previous inspection showed minor leak in rear hydraulic line. Check carefully.'
  },
  {
    id: 3,
    title: 'Engine Repair',
    equipment: 'Kubota M7-172',
    equipmentId: 3,
    type: 'corrective' as MaintenanceType,
    status: 'in-progress' as MaintenanceStatus,
    priority: 'critical' as MaintenancePriority,
    dueDate: new Date(2023, 5, 10),
    engineHours: 8,
    assignedTo: 'Sarah Johnson',
    notes: 'Engine overheating issue. Suspected damaged radiator and cooling system problems.'
  },
  {
    id: 4,
    title: 'Brake System Check',
    equipment: 'New Holland T6.180',
    equipmentId: 5,
    type: 'preventive' as MaintenanceType,
    status: 'completed' as MaintenanceStatus,
    priority: 'medium' as MaintenancePriority,
    dueDate: new Date(2023, 5, 8),
    completedDate: new Date(2023, 5, 8),
    engineHours: 2,
    actualDuration: 1.5,
    assignedTo: 'Michael Torres',
    notes: 'Routine inspection completed. Brake pads still in good condition.'
  },
  {
    id: 5,
    title: 'Transmission Service',
    equipment: 'Fendt 942 Vario',
    equipmentId: 6,
    type: 'preventive' as MaintenanceType,
    status: 'scheduled' as MaintenanceStatus,
    priority: 'high' as MaintenancePriority,
    dueDate: new Date(2023, 5, 14),
    engineHours: 4,
    assignedTo: 'David Chen',
    notes: 'Due to hours of operation. Follow service manual procedure F-942-TS.'
  },
  {
    id: 6,
    title: 'Tire Replacement',
    equipment: 'Massey Ferguson 8S.245',
    equipmentId: 4,
    type: 'corrective' as MaintenanceType,
    status: 'scheduled' as MaintenanceStatus,
    priority: 'medium' as MaintenancePriority,
    dueDate: new Date(2023, 5, 20),
    engineHours: 3,
    assignedTo: 'Sarah Johnson',
    notes: 'Replace worn rear tires. New tires ordered and expected to arrive on June 18.'
  },
  {
    id: 7,
    title: 'Annual Service',
    equipment: 'John Deere 8R 410',
    equipmentId: 1,
    type: 'preventive' as MaintenanceType,
    status: 'scheduled' as MaintenanceStatus,
    priority: 'medium' as MaintenancePriority,
    dueDate: new Date(2023, 6, 5),
    engineHours: 6,
    assignedTo: 'Michael Torres',
    notes: 'Complete annual service according to manufacturer specifications.'
  },
  {
    id: 8,
    title: 'Electrical System Repair',
    equipment: 'Kubota M7-172',
    equipmentId: 3,
    type: 'corrective' as MaintenanceType,
    status: 'pending-parts' as MaintenanceStatus,
    priority: 'high' as MaintenancePriority,
    dueDate: new Date(2023, 5, 16),
    engineHours: 4,
    assignedTo: 'David Chen',
    notes: 'Intermittent electrical issues. Waiting for diagnostic module to arrive.'
  }
];
