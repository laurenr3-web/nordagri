
// src/hooks/maintenance/types/maintenancePlanTypes.ts
export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi-annual' | 'annual' | 'biannual' | 'yearly' | 'custom' | 'other';
export type MaintenanceUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years' | 'other';
export type MaintenanceType = 'preventive' | 'predictive' | 'corrective' | 'inspection' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'critical';
export type MaintenanceStatus = 'pending' | 'in-progress' | 'completed' | 'overdue' | 'scheduled';

// Database model interface aligned with Supabase table
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
  engine_hours?: number;
  assigned_to?: string;
  equipment_name?: string;
  next_due_date?: string;
  last_performed_date?: string;
}

// Interface for frontend form values
export interface MaintenanceFormValues {
  title: string;
  equipment_id: number;
  equipment?: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  due_date: Date | string; // Allow both Date object and string
  estimated_duration?: number;
  assigned_to?: string;
  notes?: string;
  part_id?: number;
}

// Frontend model interface that has camelCase properties
export interface MaintenancePlanViewModel {
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

// Type adapter functions for converting between DB and View models
export function dbToViewModel(plan: MaintenancePlan): MaintenancePlanViewModel {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    equipmentId: plan.equipment_id,
    equipmentName: plan.equipment_name || plan.equipment || '',
    frequency: plan.frequency,
    interval: plan.interval,
    unit: plan.unit,
    nextDueDate: plan.next_due_date ? new Date(plan.next_due_date) : new Date(),
    lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : null,
    type: plan.type,
    engineHours: plan.engine_hours,
    active: plan.active,
    priority: plan.priority,
    assignedTo: plan.assigned_to
  };
}

export function viewModelToDB(plan: MaintenancePlanViewModel): MaintenancePlan {
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    equipment_id: plan.equipmentId,
    equipment_name: plan.equipmentName,
    frequency: plan.frequency,
    interval: plan.interval,
    unit: plan.unit,
    next_due_date: plan.nextDueDate.toISOString(),
    last_performed_date: plan.lastPerformedDate ? plan.lastPerformedDate.toISOString() : undefined,
    type: plan.type,
    engine_hours: plan.engineHours,
    active: plan.active,
    priority: plan.priority,
    assigned_to: plan.assignedTo
  };
}
