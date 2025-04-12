
import { MaintenancePriority, MaintenanceStatus, MaintenanceType as TaskMaintenanceType } from '../maintenanceSlice';

export type MaintenanceFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly';
export type MaintenanceUnit = 'days' | 'weeks' | 'months' | 'hours';

// Match this to the type in maintenanceSlice.ts, but preserve the export
export type MaintenanceType = 'preventive' | 'corrective' | 'condition-based' | 'predictive';

export interface MaintenancePlan {
  id: number;
  title: string;
  description: string;
  equipmentId: number;
  equipmentName: string;
  frequency: MaintenanceFrequency;
  interval: number;
  unit: MaintenanceUnit;
  nextDueDate: Date;
  lastPerformedDate: Date | null;
  type: MaintenanceType;
  engineHours: number;
  active: boolean;
  priority: MaintenancePriority;
  assignedTo: string | null;
}

export const isMaintenanceFrequency = (value: string): value is MaintenanceFrequency => {
  return ['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'yearly'].includes(value);
};

export const isMaintenanceUnit = (value: string): value is MaintenanceUnit => {
  return ['days', 'weeks', 'months', 'hours'].includes(value);
};

export const isMaintenanceType = (value: string): value is MaintenanceType => {
  return ['preventive', 'corrective', 'predictive', 'condition-based'].includes(value);
};
