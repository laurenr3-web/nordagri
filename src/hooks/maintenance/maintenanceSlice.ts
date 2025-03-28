
// Define types for the maintenance slice
export type MaintenanceType = 'preventive' | 'corrective' | 'condition-based';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending-parts';
export type MaintenancePriority = 'critical' | 'high' | 'medium' | 'low';

export interface MaintenanceTask {
  id: number;
  title: string;
  equipment: string;
  equipmentId: string; // Changed to string to match Supabase's UUID type
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  dueDate: Date;
  completedDate?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  assignedTo: string;
  notes: string;
}

export interface MaintenanceFormValues {
  title: string;
  equipment: string;
  equipmentId: string; // Changed to string to match Supabase's UUID type
  type: MaintenanceType;
  priority: MaintenancePriority;
  dueDate: Date;
  estimatedDuration: number;
  assignedTo: string;
  notes: string;
}
