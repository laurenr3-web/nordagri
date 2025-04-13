
import { addDays, addMonths, addYears, addWeeks, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenancePlan } from '@/hooks/maintenance/types/maintenancePlanTypes';
import { mapMaintenancePlanToViewModel } from '../adapters/maintenanceTypeAdapters';

/**
 * Create scheduled tasks from a maintenance plan up to a certain end date
 */
export const createTasksFromPlan = async (
  plan: MaintenancePlan, 
  endDate: Date
): Promise<MaintenanceTask[]> => {
  const maintenanceTasks: MaintenanceTask[] = [];
  const viewModel = mapMaintenancePlanToViewModel(plan);
  
  let currentDate = new Date(viewModel.nextDueDate);
  
  // Create tasks until we reach the end date
  while (currentDate <= endDate) {
    try {
      // Create and add a new maintenance task
      const taskData = {
        title: `${viewModel.title} - ${format(currentDate, 'dd/MM/yyyy', { locale: fr })}`,
        equipment: viewModel.equipmentName,
        equipment_id: viewModel.equipmentId,
        type: viewModel.type,
        priority: viewModel.priority,
        status: 'scheduled' as const,
        due_date: currentDate.toISOString(),
        engine_hours: viewModel.engineHours,
        assigned_to: viewModel.assignedTo || '',
      };
      
      const newTask = await maintenanceService.addTask(taskData);
      
      if (newTask) {
        maintenanceTasks.push({
          id: newTask.id,
          title: newTask.title,
          equipment: newTask.equipment,
          equipmentId: newTask.equipment_id,
          type: newTask.type as any,
          status: newTask.status as any,
          priority: newTask.priority as any,
          dueDate: new Date(newTask.due_date),
          engineHours: newTask.engine_hours || newTask.estimated_duration || 0,
          assignedTo: newTask.assigned_to || '',
          notes: newTask.notes || ''
        });
      }
      
      // Calculate next date based on frequency/interval/unit
      currentDate = calculateNextDate(currentDate, viewModel.unit, viewModel.interval);
      
    } catch (error) {
      console.error(`Error creating task for plan ${viewModel.id}:`, error);
      throw error;
    }
  }
  
  return maintenanceTasks;
};

/**
 * Calculate the next due date based on unit and interval
 */
const calculateNextDate = (currentDate: Date, unit: string, interval: number): Date => {
  switch (unit) {
    case 'days':
      return addDays(currentDate, interval);
    case 'weeks':
      return addWeeks(currentDate, interval);
    case 'months':
      return addMonths(currentDate, interval);
    case 'years':
      return addYears(currentDate, interval);
    case 'hours':
      // For engine hours, we still need a date, so add some reasonable time
      return addMonths(currentDate, 1); // Default to monthly for engine hours
    default:
      return addDays(currentDate, interval);
  }
};
