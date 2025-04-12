
import { MaintenancePlan } from '../types/maintenancePlanTypes';
import { MaintenanceFormValues, MaintenanceStatus, MaintenanceType as TaskMaintenanceType } from '../maintenanceSlice';
import { calculateNextDueDate } from './maintenanceDateUtils';
import { isAfter } from 'date-fns';

export const generateSchedule = (
  plan: MaintenancePlan,
  endDate: Date,
  onTaskCreated: (task: MaintenanceFormValues) => void
): void => {
  let currentDate = plan.nextDueDate;

  while (isAfter(endDate, currentDate)) {
    // When creating a task, ensure we map between the types properly
    const task: MaintenanceFormValues = {
      title: plan.title,
      equipment: plan.equipmentName,
      equipmentId: plan.equipmentId,
      // Use type casting to ensure the type is compatible with maintenanceSlice.ts MaintenanceType
      type: (plan.type === 'predictive' ? 'condition-based' : plan.type) as TaskMaintenanceType,
      status: 'scheduled' as MaintenanceStatus,
      priority: plan.priority,
      dueDate: currentDate,
      engineHours: plan.engineHours,
      notes: plan.description,
      assignedTo: plan.assignedTo || '',
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
