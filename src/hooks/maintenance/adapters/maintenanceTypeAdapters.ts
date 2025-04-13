
import { MaintenanceTask as ModelMaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenanceTask as ServiceMaintenanceTask } from '@/services/supabase/maintenanceService';

/**
 * Adapts a service MaintenanceTask to the model MaintenanceTask format
 */
export const adaptServiceTaskToModelTask = (serviceTask: any): ModelMaintenanceTask => {
  return {
    id: serviceTask.id,
    title: serviceTask.title,
    equipment: serviceTask.equipment,
    equipmentId: serviceTask.equipment_id,
    type: serviceTask.type as any,
    status: serviceTask.status as any,
    priority: serviceTask.priority as any,
    dueDate: serviceTask.due_date ? new Date(serviceTask.due_date) : new Date(),
    completedDate: serviceTask.completed_date ? new Date(serviceTask.completed_date) : undefined,
    engineHours: serviceTask.estimated_duration || serviceTask.engine_hours || 0,
    actualDuration: serviceTask.actual_duration,
    assignedTo: serviceTask.assigned_to || '',
    notes: serviceTask.notes || '',
  };
};

/**
 * Map a maintenance plan to a view model
 */
export const mapMaintenancePlanToViewModel = (plan: any) => {
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
};

/**
 * Adapts the model MaintenanceTask to the service MaintenanceTask format
 */
export const adaptModelTaskToServiceTask = (modelTask: ModelMaintenanceTask): any => {
  return {
    id: modelTask.id,
    title: modelTask.title,
    equipment: modelTask.equipment,
    equipment_id: modelTask.equipmentId,
    type: modelTask.type,
    status: modelTask.status,
    priority: modelTask.priority,
    due_date: modelTask.dueDate.toISOString(),
    completed_date: modelTask.completedDate ? modelTask.completedDate.toISOString() : null,
    estimated_duration: modelTask.engineHours,
    actual_duration: modelTask.actualDuration,
    assigned_to: modelTask.assignedTo,
    notes: modelTask.notes,
  };
};
