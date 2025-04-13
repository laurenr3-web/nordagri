
import { MaintenancePlan } from '../types/maintenancePlanTypes';
import { MaintenanceFormValues, MaintenanceStatus, MaintenanceType as TaskMaintenanceType } from '../maintenanceSlice';
import { calculateNextDueDate } from './maintenanceDateUtils';
import { isAfter } from 'date-fns';
import { mapMaintenancePlanToViewModel } from '../adapters/maintenanceTypeAdapters';

export const generateSchedule = (
  plan: MaintenancePlan,
  endDate: Date,
  onTaskCreated: (task: MaintenanceFormValues) => void
): void => {
  // First convert the plan to view model format for easier access
  const viewModel = mapMaintenancePlanToViewModel(plan);
  let currentDate = new Date(viewModel.nextDueDate);

  while (isAfter(endDate, currentDate)) {
    // When creating a task, ensure we map between the types properly
    const task: MaintenanceFormValues = {
      title: viewModel.title,
      equipment: viewModel.equipmentName,
      equipmentId: viewModel.equipmentId,
      // Use type casting to ensure the type is compatible with maintenanceSlice.ts MaintenanceType
      type: (viewModel.type === 'predictive' ? 'condition-based' : viewModel.type) as TaskMaintenanceType,
      status: 'scheduled' as MaintenanceStatus,
      priority: viewModel.priority,
      dueDate: currentDate,
      engineHours: viewModel.engineHours || 0,
      notes: viewModel.description || '',
      assignedTo: viewModel.assignedTo || '',
    };

    onTaskCreated(task);

    currentDate = calculateNextDueDate(
      viewModel.frequency,
      viewModel.interval,
      viewModel.unit,
      currentDate
    );
  }
};
