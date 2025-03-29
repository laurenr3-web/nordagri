
// Export the main hook
export { useDashboardData } from './useDashboardData';

// Export types
export type { 
  Stat, 
  EquipmentItem, 
  MaintenanceEvent, 
  AlertItem, 
  TaskItem 
} from './types';

// Export data transformers for reuse elsewhere if needed
export {
  transformStatsData,
  transformEquipmentData,
  transformMaintenanceEvents,
  transformAlerts,
  transformUpcomingTasks,
  getDueString
} from './dashboardDataTransformers';
