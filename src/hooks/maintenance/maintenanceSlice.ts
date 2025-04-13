
// Types for maintenance tasks
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled' | 'pending-parts';
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
}

export interface MaintenanceFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  type: MaintenanceType;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  dueDate: Date;
  engineHours: number;
  assignedTo: string;
  notes: string;
  partId?: string;
}
