
import { MaintenancePlan, MaintenancePlanViewModel } from '../types/maintenancePlanTypes';
import { MaintenanceFormValues, MaintenanceStatus, MaintenanceType as TaskMaintenanceType } from '../maintenanceSlice';
import { calculateNextDueDate } from './maintenanceDateUtils';
import { isAfter } from 'date-fns';

export const generateSchedule = (
  plan: MaintenancePlanViewModel,
  endDate: Date,
  onTaskCreated: (task: MaintenanceFormValues) => void
): void => {
  let currentDate = plan.nextDueDate;

  while (isAfter(endDate, currentDate)) {
    // When creating a task, ensure we map between the types properly
    const task: MaintenanceFormValues = {
      title: plan.title,
      equipment: plan.equipmentName,
      equipment_id: plan.equipmentId,
      // Use type casting to ensure the type is compatible with maintenanceSlice.ts MaintenanceType
      type: (plan.type === 'predictive' ? 'condition-based' : plan.type) as TaskMaintenanceType,
      status: 'scheduled' as MaintenanceStatus,
      priority: plan.priority,
      due_date: currentDate,
      estimated_duration: plan.engineHours,
      notes: plan.description,
      assigned_to: plan.assignedTo || '',
    };

    onTaskCreated(task);

    currentDate = calculateNextDueDate(
      plan.frequency,
      plan.interval,
      plan.unit,
      currentDate
    );
  }
};
