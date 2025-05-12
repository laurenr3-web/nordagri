
/**
 * Types for equipment data in dashboard
 */

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  image?: string;
  usage?: {
    hours: number;
    target: number;
  };
  nextService?: {
    type: string;
    due: string;
  };
  nextMaintenance?: string | null; // Keep for backward compatibility
  km?: number | null; // Add the km property
  valeur_actuelle?: number | null; // Add the valeur_actuelle property
}

// Define a type for raw equipment data from database
export interface RawEquipmentData {
  id: number;
  name?: string;
  type?: string;
  status?: string;
  image?: string;
  usage_hours?: number;
  usage_target?: number;
  model?: string;
  valeur_actuelle?: number;
}

// Define a type for maintenance task data
export interface MaintenanceTask {
  equipment_id: string;
  title: string;
  due_date: string;
}
