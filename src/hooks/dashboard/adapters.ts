
import { 
  StatsCardData, 
  EquipmentItem, 
  MaintenanceEvent, 
  AlertItem, 
  UpcomingTask 
} from './types/dashboardTypes';

export const adaptStatsData = (data: any[]): StatsCardData[] => {
  return data;
};

export const adaptEquipmentData = (data: any[]): EquipmentItem[] => {
  return data;
};

export const adaptMaintenanceEvents = (data: any[]): MaintenanceEvent[] => {
  return data.map((event: any) => {
    // Convert priority to one of the allowed values
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (event.priority) {
      const lowerPriority = event.priority.toLowerCase();
      if (lowerPriority === 'low' || lowerPriority === 'medium' || lowerPriority === 'high') {
        priority = lowerPriority as 'low' | 'medium' | 'high';
      }
    }
    
    return {
      id: event.id || Math.random().toString(), // Keep the id as is, might be string or number
      title: event.title || 'Maintenance',
      date: event.dueDate ? new Date(event.dueDate) : new Date(),
      equipment: event.equipment || 'Équipement non spécifié',
      status: event.status || 'scheduled',
      priority: priority,
      assignedTo: event.assignedTo || 'Non assigné',
      duration: event.estimatedDuration || 0 
    };
  });
};

export const adaptAlertItems = (data: any[]): AlertItem[] => {
  return data.map((alert: any) => ({
    id: Number(alert.id) || Math.floor(Math.random() * 1000),
    title: alert.title || 'Alerte',
    message: alert.message || 'Description de l\'alerte',
    severity: alert.severity || 'medium',
    date: alert.date ? new Date(alert.date) : new Date(),
    equipmentId: alert.equipmentId || 0,
    equipmentName: alert.equipmentName || 'Équipement non spécifié',
    status: alert.status || 'new',
    type: alert.type || 'maintenance',
    time: alert.time || '12:00',
    equipment: alert.equipment || 'N/A'
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
