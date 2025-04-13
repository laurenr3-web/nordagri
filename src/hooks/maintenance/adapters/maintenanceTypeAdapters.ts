
import { 
  MaintenancePlan, 
  MaintenancePlanViewModel, 
  MaintenanceFormValues as PlanFormValues,
  MaintenanceStatus as PlanMaintenanceStatus,
  MaintenanceType as PlanMaintenanceType,
} from '../types/maintenancePlanTypes';

import { 
  MaintenanceStatus, 
  MaintenanceType,
  MaintenanceFormValues
} from '../maintenanceSlice';

/**
 * Map a database maintenance plan to the frontend view model
 */
export function mapMaintenancePlanToViewModel(plan: MaintenancePlan): MaintenancePlanViewModel {
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
    type: mapMaintenanceTypeToPlanType(plan.type),
    engineHours: plan.engine_hours,
    active: plan.active,
    priority: plan.priority,
    assignedTo: plan.assigned_to
  };
}

/**
 * Map a frontend view model to the database plan format
 */
export function mapViewModelToMaintenancePlan(viewModel: MaintenancePlanViewModel): MaintenancePlan {
  return {
    id: viewModel.id,
    title: viewModel.title,
    description: viewModel.description,
    equipment_id: viewModel.equipmentId,
    equipment_name: viewModel.equipmentName,
    frequency: viewModel.frequency,
    interval: viewModel.interval,
    unit: viewModel.unit,
    next_due_date: viewModel.nextDueDate.toISOString(),
    last_performed_date: viewModel.lastPerformedDate ? viewModel.lastPerformedDate.toISOString() : undefined,
    type: viewModel.type,
    engine_hours: viewModel.engineHours,
    active: viewModel.active,
    priority: viewModel.priority,
    assigned_to: viewModel.assignedTo
  };
}

/**
 * Map maintenance plan type to task type (ensuring compatibility)
 */
export function mapMaintenanceTypeToTaskType(type: PlanMaintenanceType): MaintenanceType {
  switch (type) {
    case 'preventive': return 'preventive';
    case 'predictive': return 'condition-based';
    case 'corrective': return 'corrective';
    case 'inspection': return 'inspection';
    // Handle extra types in plan type that don't exist in task type
    case 'other': 
    default:
      return 'preventive';
  }
}

/**
 * Map maintenance status between different formats
 */
export function mapPlanStatusToTaskStatus(status: PlanMaintenanceStatus): MaintenanceStatus {
  switch (status) {
    case 'pending': return 'scheduled';
    case 'in-progress': return 'in-progress';
    case 'completed': return 'completed';
    case 'overdue': return 'overdue';
    // Special case mappings
    case 'scheduled': return 'scheduled';
    default:
      return 'scheduled';
  }
}

/**
 * Map a task status string to a valid MaintenanceStatus enum value
 */
export function safeMaintenanceStatus(status: string): MaintenanceStatus {
  const validStatuses: MaintenanceStatus[] = ['scheduled', 'in-progress', 'completed', 'overdue'];
  return validStatuses.includes(status as MaintenanceStatus) 
    ? status as MaintenanceStatus 
    : 'scheduled';
}

/**
 * Map a maintenance type string to a valid MaintenanceType enum value
 */
export function safeMaintenanceType(type: string): MaintenanceType {
  const validTypes: MaintenanceType[] = ['preventive', 'corrective', 'condition-based', 'inspection'];
  return validTypes.includes(type as MaintenanceType)
    ? type as MaintenanceType
    : 'preventive';
}

/**
 * Map maintenance plan type to frontend type
 */
export function mapMaintenanceTypeToPlanType(type: string): PlanMaintenanceType {
  const validTypes: PlanMaintenanceType[] = ['preventive', 'predictive', 'corrective', 'inspection', 'other'];
  return validTypes.includes(type as PlanMaintenanceType)
    ? type as PlanMaintenanceType
    : 'preventive';
}

/**
 * Convert plan form values to task form values
 */
export function convertPlanFormToTaskForm(planForm: PlanFormValues): MaintenanceFormValues {
  return {
    title: planForm.title,
    equipment: planForm.equipment || '',
    equipmentId: planForm.equipment_id,
    type: mapMaintenanceTypeToTaskType(planForm.type),
    status: 'scheduled',
    priority: planForm.priority,
    dueDate: new Date(planForm.due_date),
    engineHours: planForm.estimated_duration,
    assignedTo: planForm.assigned_to || '',
    notes: planForm.notes
  };
}
