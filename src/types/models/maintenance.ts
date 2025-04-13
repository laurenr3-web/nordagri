
import { BaseEntity, TimestampFields } from './common';

/**
 * Maintenance status type
 */
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'overdue' | 'cancelled' | 'pending-parts';

/**
 * Maintenance priority type
 */
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';

/**
 * Maintenance type
 */
export type MaintenanceType = 'preventive' | 'corrective' | 'condition-based' | 'predictive' | 'inspection' | 'other';

/**
 * Maintenance frequency type
 */
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'biannual' | 'yearly' | 'custom' | 'other';

/**
 * Maintenance unit type
 */
export type MaintenanceUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years' | 'other';

/**
 * Maintenance task entity interface
 */
export interface MaintenanceTask extends BaseEntity, TimestampFields {
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

/**
 * Maintenance task database model interface
 */
export interface MaintenanceTaskDB {
  id: number;
  title: string;
  equipment: string;
  equipment_id: number;
  type: string;
  status: string;
  priority: string;
  due_date: string;
  completed_date?: string;
  engine_hours: number;
  actual_duration?: number;
  estimated_duration?: number;
  assigned_to: string;
  notes?: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maintenance form values interface
 */
export interface MaintenanceFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  equipment_id?: number; // For compatibility with API
  type: MaintenanceType;
  priority: MaintenancePriority;
  dueDate: Date;
  due_date?: string; // For compatibility with API
  engineHours: number;
  engine_hours?: number; // For compatibility with API
  estimated_duration?: number; // For compatibility with API
  assignedTo?: string;
  assigned_to?: string; // For compatibility with API
  notes?: string;
  status?: MaintenanceStatus;
}

/**
 * Maintenance plan entity interface
 */
export interface MaintenancePlan extends BaseEntity {
  id: number;
  title: string;
  description?: string;
  equipmentId: number;
  equipment_id?: number; // For compatibility with API
  equipmentName: string;
  equipment_name?: string; // For compatibility with API
  frequency: MaintenanceFrequency;
  interval: number;
  unit: MaintenanceUnit;
  nextDueDate: Date;
  next_due_date?: string; // For compatibility with API
  lastPerformedDate?: Date | null;
  last_performed_date?: string; // For compatibility with API
  type: MaintenanceType;
  engineHours?: number;
  engine_hours?: number; // For compatibility with API
  active: boolean;
  priority: MaintenancePriority;
  assignedTo?: string;
  assigned_to?: string; // For compatibility with API
}

/**
 * Maintenance plan database model interface
 */
export interface MaintenancePlanDB {
  id: number;
  title: string;
  description?: string;
  equipment_id: number;
  equipment_name: string;
  frequency: string;
  interval: number;
  unit: string;
  next_due_date: string;
  last_performed_date?: string;
  type: string;
  engine_hours?: number;
  active: boolean;
  priority: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
