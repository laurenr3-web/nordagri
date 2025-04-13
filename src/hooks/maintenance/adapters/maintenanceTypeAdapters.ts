
import { MaintenancePriority, MaintenanceFrequency, MaintenanceType, MaintenanceUnit } from '../types/maintenancePlanTypes';
import { MaintenanceTask as ServiceMaintenanceTask } from '@/services/supabase/maintenanceService';
import { MaintenanceTask as ModelMaintenanceTask } from '../maintenanceSlice';

// Export types for reuse
export type { MaintenancePriority, MaintenanceFrequency, MaintenanceType, MaintenanceUnit };

/**
 * Adapts a maintenance task from the service format to the application model format
 */
export function adaptServiceTaskToModelTask(task: ServiceMaintenanceTask): ModelMaintenanceTask {
  return {
    id: task.id,
    title: task.title,
    equipmentId: task.equipment_id,
    equipment: task.equipment,
    dueDate: new Date(task.due_date),
    status: task.status as any, // Cast to match the enum values
    priority: task.priority as any, // Cast to match the enum values
    type: task.type as any, // Cast to match the enum values
    engineHours: task.estimated_duration || 0,
    actualDuration: task.actual_duration,
    assignedTo: task.assigned_to || '',
    notes: task.notes || '',
    completedDate: task.completed_date ? new Date(task.completed_date) : undefined
  };
}

/**
 * Adapts a maintenance task from the application model to the service format
 */
export function adaptModelTaskToServiceTask(task: ModelMaintenanceTask): Omit<ServiceMaintenanceTask, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: task.title,
    equipment: task.equipment,
    equipment_id: task.equipmentId,
    due_date: task.dueDate.toISOString(),
    status: task.status,
    priority: task.priority,
    type: task.type,
    estimated_duration: task.engineHours,
    actual_duration: task.actualDuration,
    assigned_to: task.assignedTo,
    notes: task.notes,
    completed_date: task.completedDate ? task.completedDate.toISOString() : undefined
  };
}

/**
 * Adapts a form values object to a service task format
 */
export function adaptFormValuesToServiceTask(formValues: any): Omit<ServiceMaintenanceTask, 'id' | 'created_at' | 'updated_at'> {
  return {
    title: formValues.title,
    equipment: formValues.equipment,
    equipment_id: formValues.equipmentId || formValues.equipment_id,
    due_date: formValues.dueDate ? formValues.dueDate.toISOString() : formValues.due_date,
    status: formValues.status,
    priority: formValues.priority,
    type: formValues.type,
    estimated_duration: formValues.engineHours,
    actual_duration: formValues.actualDuration,
    assigned_to: formValues.assignedTo,
    notes: formValues.notes,
    completed_date: formValues.completedDate ? formValues.completedDate.toISOString() : undefined
  };
}
