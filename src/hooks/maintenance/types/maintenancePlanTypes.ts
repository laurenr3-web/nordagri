
// Types for maintenance planning module
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly' | 'custom';

export type MaintenanceUnit = 'days' | 'weeks' | 'months' | 'years' | 'hours';

export type MaintenanceType = 'preventive' | 'predictive' | 'corrective' | 'inspection' | 'lubrication' | 'electrical' | 'mechanical' | 'hydraulic' | 'other';

export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

// Interface for a scheduled maintenance plan
export interface MaintenancePlan {
  id: number;
  title: string;
  description?: string;
  equipmentId: number;
  equipmentName: string;
  frequency: MaintenanceFrequency;
  interval: number;
  unit: MaintenanceUnit;
  nextDueDate: Date;
  lastPerformedDate: Date | null;
  type: MaintenanceType;
  engineHours?: number;
  active: boolean;
  priority: MaintenancePriority;
  assignedTo?: string;
}
