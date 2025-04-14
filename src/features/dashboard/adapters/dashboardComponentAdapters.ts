
import { 
  StatsData, 
  EquipmentData, 
  MaintenanceEvent, 
  AlertItem, 
  Task 
} from '@/hooks/dashboard/types/dashboardTypes';

/**
 * Adaptateur pour les données de statistiques
 */
export function adaptStatsData(statsData: StatsData[]) {
  if (!statsData || !statsData.length) {
    // Données par défaut si aucune donnée n'est disponible
    return [
      {
        id: 1,
        title: "Équipements actifs",
        value: "0",
        change: "0%",
        type: "neutral"
      },
      {
        id: 2,
        title: "Tâches de maintenance",
        value: "0",
        change: "0%",
        type: "neutral"
      },
      {
        id: 3,
        title: "Inventaire des pièces",
        value: "0",
        change: "0%",
        type: "neutral"
      },
      {
        id: 4,
        title: "Interventions terrain",
        value: "0",
        change: "0%",
        type: "neutral"
      }
    ];
  }
  return statsData;
}

/**
 * Adaptateur pour les données d'équipement
 */
export function adaptEquipmentData(equipmentData: EquipmentData[]) {
  if (!equipmentData || !equipmentData.length) {
    return [];
  }
  return equipmentData;
}

/**
 * Adaptateur pour les événements de maintenance
 */
export function adaptMaintenanceEvents(maintenanceEvents: MaintenanceEvent[]) {
  if (!maintenanceEvents || !maintenanceEvents.length) {
    return [];
  }
  
  return maintenanceEvents.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description || '',
    startDate: event.due_date ? new Date(event.due_date) : new Date(),
    endDate: event.due_date ? new Date(new Date(event.due_date).getTime() + 60*60*1000) : new Date(new Date().getTime() + 60*60*1000),
    status: event.status || 'scheduled',
    priority: event.priority || 'medium',
    type: 'maintenance'
  }));
}

/**
 * Adaptateur pour les alertes
 */
export function adaptAlertItems(alertItems: AlertItem[]) {
  if (!alertItems || !alertItems.length) {
    // Données par défaut si aucune alerte n'est disponible
    return [
      {
        id: 1,
        title: "Maintenance requise",
        message: "Le tracteur a atteint 500 heures de fonctionnement",
        type: "maintenance",
        date: new Date()
      },
      {
        id: 2,
        title: "Stock faible",
        message: "Filtre à huile en quantité limitée (2 restants)",
        type: "inventory",
        date: new Date()
      }
    ];
  }
  return alertItems;
}

/**
 * Adaptateur pour les tâches à venir
 */
export function adaptUpcomingTasks(tasks: Task[]) {
  if (!tasks || !tasks.length) {
    return [];
  }
  
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    description: task.description || task.notes || '',
    dueDate: task.due_date ? new Date(task.due_date) : new Date(),
    status: task.status || 'pending',
    priority: task.priority || 'medium',
    assignedTo: task.assigned_to || 'Non assigné'
  }));
}
