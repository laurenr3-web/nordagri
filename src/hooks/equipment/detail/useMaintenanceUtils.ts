
import { getComputedWearValue } from '@/components/equipment/detail/statusHelpers';

export function useMaintenanceUtils() {
  
  const getLastMaintenanceDate = (maintenanceTasks: any[]) => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return null;
    
    const completedTasks = maintenanceTasks
      .filter(task => task.status === 'completed')
      .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());
    
    return completedTasks.length > 0 ? completedTasks[0].completedDate : null;
  };
  
  const getNextServiceInfo = (maintenanceTasks: any[], equipment?: any) => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) return null;
    
    const currentHours = getComputedWearValue(equipment) ?? 0;
    
    const scheduledTasks = maintenanceTasks
      .filter(task => task.status === 'scheduled')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    if (scheduledTasks.length === 0) return null;
    
    const nextTask = scheduledTasks[0];
    
    const getTypeText = (type: string) => {
      const typeMap: Record<string, string> = {
        'oil_change': 'Vidange',
        'filter_change': 'Remplacement de filtre',
        'inspection': 'Inspection',
        'repair': 'Réparation',
        'belt_change': 'Remplacement de courroie',
        'tire_change': 'Remplacement de pneus',
        'battery_change': 'Remplacement de batterie',
      };
      return typeMap[type] || 'Maintenance';
    };
    
    // Determine if overdue based on trigger type
    const triggerUnit = nextTask.trigger_unit || 'none';
    let overdue = false;
    let dueLabel = nextTask.dueDate;
    
    if (triggerUnit === 'hours' && nextTask.triggerHours) {
      overdue = currentHours >= nextTask.triggerHours;
      const remaining = nextTask.triggerHours - currentHours;
      dueLabel = overdue 
        ? `Dépassé de ${Math.abs(Math.round(remaining))} h`
        : `Dans ${Math.round(remaining)} h`;
    } else if (triggerUnit === 'kilometers' && nextTask.triggerKilometers) {
      overdue = currentHours >= nextTask.triggerKilometers;
      const remaining = nextTask.triggerKilometers - currentHours;
      dueLabel = overdue
        ? `Dépassé de ${Math.abs(Math.round(remaining))} km`
        : `Dans ${Math.round(remaining)} km`;
    } else {
      overdue = new Date(nextTask.dueDate) < new Date();
    }
    
    return {
      type: getTypeText(nextTask.type),
      due: dueLabel,
      id: nextTask.id,
      priority: nextTask.priority,
      overdue
    };
  };
  
  const isMaintenanceOverdue = (equipment: any) => {
    if (!equipment) return false;
    
    if (equipment.nextService?.overdue) return true;
    
    if (equipment.nextService && new Date(equipment.nextService.due) < new Date()) {
      return true;
    }
    
    if (equipment.usage?.target && equipment.usage.hours >= equipment.usage.target) {
      return true;
    }
    
    return false;
  };
  
  return {
    getLastMaintenanceDate,
    getNextServiceInfo,
    isMaintenanceOverdue
  };
}
