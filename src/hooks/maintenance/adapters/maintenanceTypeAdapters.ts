/**
 * Adapters for maintenance types to convert between different formats
 */

import { MaintenanceTask, MaintenanceTaskDB, MaintenanceStatus, MaintenancePriority } from '@/types/models/maintenance';
import { safeDate, safeEnumValue } from '@/utils/typeTransformers';

/**
 * Convert a task from the service format to the model format
 */
export function adaptServiceTaskToModelTask(serviceTask: MaintenanceTaskDB): MaintenanceTask {
  // Handle the status conversion with validation
  let status: MaintenanceStatus = safeEnumValue(
    serviceTask.status,
    ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const,
    'scheduled'
  );
  
  // Handle overdue status special case
  if (serviceTask.due_date) {
    const dueDate = new Date(serviceTask.due_date);
    const now = new Date();
    if (dueDate < now && status === 'scheduled') {
      status = 'overdue';
    }
  }

  // Convert task to model format
  return {
    id: serviceTask.id,
    title: serviceTask.title,
    equipment: serviceTask.equipment,
    equipmentId: serviceTask.equipment_id,
    type: safeEnumValue(
      serviceTask.type,
      ['preventive', 'corrective', 'condition-based'] as const,
      'preventive'
    ),
    status,
    priority: safeEnumValue(
      serviceTask.priority,
      ['low', 'medium', 'high', 'critical'] as const, 
      'medium'
    ),
    dueDate: safeDate(serviceTask.due_date) || new Date(),
    completedDate: serviceTask.completed_date ? safeDate(serviceTask.completed_date) : undefined,
    engineHours: serviceTask.engine_hours,
    actualDuration: serviceTask.actual_duration,
    assignedTo: serviceTask.assigned_to || '',
    notes: serviceTask.notes || '',
    ownerId: serviceTask.owner_id
  };
}

/**
 * Convert a task from the model format to the service format
 */
export function adaptModelTaskToServiceTask(modelTask: Partial<MaintenanceTask>): Partial<MaintenanceTaskDB> {
  const result: Partial<MaintenanceTaskDB> = {};
  
  // Map fields that need conversion
  if (modelTask.id !== undefined) result.id = modelTask.id;
  if (modelTask.title !== undefined) result.title = modelTask.title;
  if (modelTask.equipment !== undefined) result.equipment = modelTask.equipment;
  if (modelTask.equipmentId !== undefined) result.equipment_id = modelTask.equipmentId;
  if (modelTask.type !== undefined) result.type = modelTask.type;
  if (modelTask.status !== undefined) result.status = modelTask.status;
  if (modelTask.priority !== undefined) result.priority = modelTask.priority;
  
  // Handle date conversions
  if (modelTask.dueDate !== undefined) {
    result.due_date = modelTask.dueDate instanceof Date 
      ? modelTask.dueDate.toISOString()
      : modelTask.dueDate;
  }
  
  if (modelTask.completedDate !== undefined) {
    result.completed_date = modelTask.completedDate instanceof Date 
      ? modelTask.completedDate.toISOString()
      : modelTask.completedDate;
  }
  
  // Map other fields
  if (modelTask.engineHours !== undefined) result.engine_hours = modelTask.engineHours;
  if (modelTask.actualDuration !== undefined) result.actual_duration = modelTask.actualDuration;
  if (modelTask.assignedTo !== undefined) result.assigned_to = modelTask.assignedTo;
  if (modelTask.notes !== undefined) result.notes = modelTask.notes;
  if (modelTask.ownerId !== undefined) result.owner_id = modelTask.ownerId;
  
  return result;
}

/**
 * Determine the status of a task based on its due date
 */
export function determineTaskStatus(
  task: Pick<MaintenanceTask, 'status' | 'dueDate'>,
  currentDate: Date = new Date()
): MaintenanceStatus {
  // If task is already completed or in other terminal states, keep the status
  if (
    task.status === 'completed' || 
    task.status === 'cancelled' ||
    task.status === 'in-progress'
  ) {
    return task.status;
  }
  
  // Check if task is overdue
  if (task.dueDate < currentDate && task.status === 'scheduled') {
    return 'overdue';
  }
  
  return task.status;
}

/**
 * Convert a numeric priority to a typed priority
 */
export function getPriorityFromValue(value: number): MaintenancePriority {
  switch (value) {
    case 0:
      return 'low';
    case 1:
      return 'medium';
    case 2:
      return 'high';
    case 3:
      return 'critical';
    default:
      return 'medium';
  }
}
