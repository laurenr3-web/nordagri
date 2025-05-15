
import { maintenanceTasksService } from './maintenance/maintenanceTasksService';
import { maintenancePlansService } from './maintenance/maintenancePlansService';

// Créer un service unifié qui regroupe les fonctionnalités des deux services spécialisés
export const maintenanceService = {
  // Méthodes de maintenanceTasksService
  getTasks: maintenanceTasksService.getTasks.bind(maintenanceTasksService),
  addTask: maintenanceTasksService.addTask.bind(maintenanceTasksService),
  bulkCreateMaintenance: maintenanceTasksService.bulkCreateMaintenance.bind(maintenanceTasksService),
  updateTaskStatus: maintenanceTasksService.updateTaskStatus.bind(maintenanceTasksService),
  updateTaskPriority: maintenanceTasksService.updateTaskPriority.bind(maintenanceTasksService),
  deleteTask: maintenanceTasksService.deleteTask.bind(maintenanceTasksService),
  getTasksForEquipment: maintenanceTasksService.getTasksForEquipment.bind(maintenanceTasksService),
  completeTask: maintenanceTasksService.completeTask.bind(maintenanceTasksService),

  // Méthodes de maintenancePlansService
  getMaintenancePlans: maintenancePlansService.getMaintenancePlans.bind(maintenancePlansService),
  getMaintenancePlansForEquipment: maintenancePlansService.getMaintenancePlansForEquipment.bind(maintenancePlansService),
  addMaintenancePlan: maintenancePlansService.addMaintenancePlan.bind(maintenancePlansService),
  updateMaintenancePlan: maintenancePlansService.updateMaintenancePlan.bind(maintenancePlansService),
};

// Export the services
export {
  maintenanceTasksService,
  maintenancePlansService,
};
