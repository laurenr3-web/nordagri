
// Types for maintenance tasks
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending-parts';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceType = 'preventive' | 'corrective' | 'condition-based';

export interface MaintenanceTask {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  dueDate: Date;
  completedDate?: Date;
  engineHours: number;
  actualDuration?: number;
  assignedTo: string;
  notes: string;
  trigger_unit?: string;
  trigger_hours?: number;
  trigger_kilometers?: number;
  completed_at_hours?: number;
  completed_at_km?: number;
  is_recurrent?: boolean;
  recurrence_interval?: number;
  recurrence_unit?: string;
}

export interface MaintenanceFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  type: MaintenanceType;
  priority: MaintenancePriority;
  dueDate: Date;
  engineHours: number;
  assignedTo: string;
  notes: string;
  partId?: string;
  trigger_unit?: string;
  trigger_hours?: number;
  trigger_kilometers?: number;
}
