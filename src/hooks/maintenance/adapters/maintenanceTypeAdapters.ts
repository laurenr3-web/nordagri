
import { MaintenanceTask as ServiceMaintenanceTask } from '@/services/supabase/maintenanceService';
import { MaintenanceTask as ModelMaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { 
  MaintenanceType, 
  MaintenanceStatus, 
  MaintenancePriority,
  MaintenancePlan,
  MaintenancePlanViewModel,
  dbToViewModel,
  viewModelToDB
} from '../types/maintenancePlanTypes';

// Re-export the conversion functions for maintenance plans
export { dbToViewModel, viewModelToDB };

/**
 * Adapts a service task (from Supabase) to the UI model task
 */
export function adaptServiceTaskToModelTask(task: ServiceMaintenanceTask): ModelMaintenanceTask {
  return {
    id: task.id,
    title: task.title,
    equipment: task.equipment,
    equipmentId: task.equipment_id,
    type: task.type as MaintenanceType,
    status: mapStatus(task.status),
    priority: task.priority as MaintenancePriority,
    dueDate: new Date(task.due_date),
    completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
    engineHours: task.estimated_duration || 0,
    actualDuration: task.actual_duration,
    assignedTo: task.assigned_to || '',
    notes: task.notes || ''
  };
}

/**
 * Adapts a model task to service task format for Supabase
 */
export function adaptModelTaskToServiceTask(task: ModelMaintenanceTask): Partial<ServiceMaintenanceTask> {
  return {
    id: task.id,
    title: task.title,
    equipment: task.equipment,
    equipment_id: task.equipmentId,
    type: task.type,
    status: task.status === 'scheduled' ? 'pending' : task.status,
    priority: task.priority,
    due_date: task.dueDate.toISOString(),
    completed_date: task.completedDate ? task.completedDate.toISOString() : undefined,
    estimated_duration: task.engineHours,
    actual_duration: task.actualDuration,
    assigned_to: task.assignedTo,
    notes: task.notes
  };
}

/**
 * Maps status strings to ensure compatibility
 */
function mapStatus(status: string): MaintenanceStatus {
  if (status === 'scheduled') return 'pending';
  if (status === 'in progress' || status === 'in_progress') return 'in-progress';
  if (status === 'completed') return 'completed';
  if (status === 'overdue') return 'overdue';
  return 'pending'; // Default fallback
}
