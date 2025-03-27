
// Re-export all equipment service functionality from the new modular structure
import { 
  Equipment,
  EquipmentFilter,
  EquipmentStats,
  FilterOptions
} from './equipment/types';

import {
  getEquipment,
  searchEquipment,
  getEquipmentById,
  getEquipmentStats,
  getEquipmentMaintenanceHistory,
  getFilterOptions
} from './equipment/queries';

import {
  addEquipment,
  updateEquipment,
  deleteEquipment
} from './equipment/mutations';

// Export types
export type { 
  Equipment,
  EquipmentFilter,
  EquipmentStats,
  FilterOptions
};

// Create a service object with all functions
export const equipmentService = {
  // Queries
  getEquipment,
  searchEquipment,
  getEquipmentById,
  getEquipmentStats,
  getEquipmentMaintenanceHistory,
  getFilterOptions,
  
  // Mutations
  addEquipment,
  updateEquipment,
  deleteEquipment
};

// For backward compatibility, also export individual functions
export {
  getEquipment,
  searchEquipment,
  getEquipmentById,
  getEquipmentStats,
  getEquipmentMaintenanceHistory,
  getFilterOptions,
  addEquipment,
  updateEquipment,
  deleteEquipment
};
