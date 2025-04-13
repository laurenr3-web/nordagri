
import { addDays, addMonths, addYears, addWeeks, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { MaintenancePlan } from '@/hooks/maintenance/types/maintenancePlanTypes';

// Utility function to convert from snake_case to camelCase for view models
const toCamelCase = (obj: any) => {
  if (obj === null || typeof obj !== 'object') return obj;
  
  // Handle array
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  
  const result: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
    }
  }
  return result;
};

// Function to map a maintenance plan to its view model format
const mapMaintenancePlanToViewModel = (plan: any) => {
  // Handle both snake_case and camelCase properties
  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    equipmentId: plan.equipmentId || plan.equipment_id,
    equipmentName: plan.equipmentName || plan.equipment_name,
    frequency: plan.frequency,
    interval: plan.interval,
    unit: plan.unit,
    nextDueDate: plan.nextDueDate instanceof Date ? plan.nextDueDate : 
                new Date(plan.nextDueDate || plan.next_due_date),
    lastPerformedDate: plan.lastPerformedDate || plan.last_performed_date ? 
                       new Date(plan.lastPerformedDate || plan.last_performed_date) : null,
    type: plan.type,
    engineHours: plan.engineHours || plan.engine_hours,
    active: plan.active,
    priority: plan.priority,
    assignedTo: plan.assignedTo || plan.assigned_to
  };
};

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
        estimated_duration: viewModel.engineHours,
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
          engineHours: newTask.estimated_duration || 0,
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
