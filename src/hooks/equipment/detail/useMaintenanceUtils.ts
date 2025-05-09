
import { useState, useEffect } from 'react';

export function useMaintenanceUtils() {
  
  // Fonction pour obtenir la date de la dernière maintenance réalisée
  const getLastMaintenanceDate = (maintenanceTasks: any[]) => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) {
      return null;
    }
    
    const completedTasks = maintenanceTasks
      .filter(task => task.status === 'completed')
      .sort((a, b) => new Date(b.completedDate).getTime() - new Date(a.completedDate).getTime());
    
    return completedTasks.length > 0 ? completedTasks[0].completedDate : null;
  };
  
  // Fonction pour obtenir les informations sur la prochaine maintenance
  const getNextServiceInfo = (maintenanceTasks: any[]) => {
    if (!maintenanceTasks || maintenanceTasks.length === 0) {
      return null;
    }
    
    // Trier les tâches par date d'échéance
    const scheduledTasks = maintenanceTasks
      .filter(task => task.status === 'scheduled')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    if (scheduledTasks.length === 0) {
      return null;
    }
    
    const nextTask = scheduledTasks[0];
    
    // Convertir le type de maintenance en texte lisible
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
    
    return {
      type: getTypeText(nextTask.type),
      due: nextTask.dueDate,
      id: nextTask.id,
      priority: nextTask.priority,
      overdue: new Date(nextTask.dueDate) < new Date()
    };
  };
  
  // Vérifier si une maintenance est en retard
  const isMaintenanceOverdue = (equipment: any) => {
    if (!equipment) return false;
    
    // Vérifier si la maintenance prévue est en retard
    if (equipment.nextService && new Date(equipment.nextService.due) < new Date()) {
      return true;
    }
    
    // Vérifier si l'équipement a dépassé ses heures d'utilisation prévues
    if (
      equipment.usage && 
      equipment.usage.target && 
      equipment.usage.hours >= equipment.usage.target
    ) {
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
