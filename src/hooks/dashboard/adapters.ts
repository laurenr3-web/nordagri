
import { 
  StatsCardData, 
  EquipmentItem, 
  MaintenanceEvent, 
  AlertItem, 
  UpcomingTask 
} from './useDashboardData';

export const adaptStatsData = (data: any[]): StatsCardData[] => {
  return data;
};

export const adaptEquipmentData = (data: any[]): EquipmentItem[] => {
  return data;
};

export const adaptMaintenanceEvents = (data: any[]): MaintenanceEvent[] => {
  return data.map((event: any) => ({
    id: event.id || Math.random().toString(),
    title: event.title || 'Maintenance',
    date: event.dueDate ? new Date(event.dueDate) : new Date(),
    equipment: event.equipment || 'Équipement non spécifié',
    status: event.status || 'scheduled',
    priority: event.priority || 'medium',
    assignedTo: event.assignedTo || 'Non assigné',
    duration: event.estimatedDuration || 0 // Adding the duration property
  }));
};

export const adaptAlertItems = (data: any[]): AlertItem[] => {
  return data.map((alert: any) => ({
    id: alert.id || Math.random().toString(),
    title: alert.title || 'Alerte',
    message: alert.message || 'Description de l\'alerte',
    severity: alert.severity || 'medium',
    date: alert.date ? new Date(alert.date) : new Date(),
    equipmentId: alert.equipmentId || 0,
    equipmentName: alert.equipmentName || 'Équipement non spécifié',
    status: alert.status || 'new',
    type: alert.type || 'maintenance',
    time: alert.time || '12:00', // Adding the missing time property
    equipment: alert.equipment || 'N/A' // Adding the missing equipment property
  }));
};

export const adaptUpcomingTasks = (data: any[]): UpcomingTask[] => {
  return data.map((task: any) => ({
    id: task.id || Math.random().toString(),
    title: task.title || 'Tâche',
    description: task.description || task.notes || 'Description de la tâche',
    dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    assignedTo: task.assignedTo || 'Non assigné'
  }));
};
