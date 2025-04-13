
// src/hooks/maintenance/types/maintenancePlanTypes.ts
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'other';
export type MaintenanceUnit = 'hours' | 'days' | 'months' | 'years' | 'other';
export type MaintenanceType = 'preventive' | 'predictive' | 'corrective' | 'inspection' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'scheduled';

export interface MaintenancePlan {
  id: number;
  title: string;
  description?: string;
  equipment_id: number;
  equipment?: string;
  frequency: MaintenanceFrequency;
  interval: number;
  unit: MaintenanceUnit;
  type: MaintenanceType;
  priority: MaintenancePriority;
  next_date?: string;
  last_date?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface MaintenanceFormValues {
  title: string;
  equipment_id: number;
  equipment?: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority; 
  due_date: Date | null;
  engineHours?: number;
  assignedTo?: string;
  notes?: string;
  partId?: number;
}
