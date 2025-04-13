
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceFrequency, MaintenanceType, MaintenanceUnit, MaintenancePriority, MaintenancePlan } from '@/hooks/maintenance/types/maintenancePlanTypes';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { toast } from 'sonner';

// Define types for the maintenance tasks and form data
export type MaintenanceTask = {
  id: number;
  title: string;
  notes?: string;
  equipment: string;
  equipment_id: number;
  due_date: string;
  completed_date?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: MaintenancePriority;
  type: MaintenanceType;
  estimated_duration?: number;
  actual_duration?: number;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
};

export type MaintenanceFormValues = {
  title: string;
  notes?: string;
  equipment: string;
  equipment_id: number;
  due_date: Date;
  type: MaintenanceType;
  priority: MaintenancePriority;
  estimated_duration?: number;
  assigned_to?: string;
};

// Get all maintenance tasks
export async function getTasks(): Promise<MaintenanceTask[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching maintenance tasks:', error);
    throw error;
  }
}

// Get tasks for a specific equipment
export async function getTasksForEquipment(equipmentId: number): Promise<MaintenanceTask[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error(`Error fetching maintenance tasks for equipment ${equipmentId}:`, error);
    throw error;
  }
}

// Add a new maintenance task
export async function addTask(task: MaintenanceFormValues): Promise<MaintenanceTask> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert({
        title: task.title,
        notes: task.notes,
        equipment: task.equipment,
        equipment_id: task.equipment_id,
        due_date: task.due_date.toISOString(),
        status: 'pending',
        priority: task.priority,
        type: task.type,
        estimated_duration: task.estimated_duration,
        assigned_to: task.assigned_to
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding maintenance task:', error);
    throw error;
  }
}

// Update a maintenance task
export async function updateTask(id: number, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating maintenance task ${id}:`, error);
    throw error;
  }
}

// Complete a maintenance task
export async function completeTask(
  id: number, 
  actualDuration?: number, 
  notes?: string
): Promise<MaintenanceTask> {
  try {
    const now = new Date();
    const updates = {
      status: 'completed',
      completed_date: now.toISOString(),
      actual_duration: actualDuration,
      notes: notes
    };

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Find associated maintenance plan if exists and update next due date
    const task = data;
    if (task) {
      try {
        // Check if this task is part of a maintenance plan
        const { data: planData } = await supabase
          .from('maintenance_plans')
          .select('*')
          .eq('equipment_id', task.equipment_id)
          .eq('title', task.title);
          
        if (planData && planData.length > 0) {
          const plan = planData[0];
          
          // Calculate next due date based on plan frequency
          let nextDueDate = new Date();
          
          if (plan.frequency === 'daily') {
            nextDueDate = addDays(now, 1);
          } else if (plan.frequency === 'weekly') {
            nextDueDate = addWeeks(now, 1);
          } else if (plan.frequency === 'monthly') {
            nextDueDate = addMonths(now, 1);
          } else if (plan.frequency === 'quarterly') {
            nextDueDate = addMonths(now, 3);
          } else if (plan.frequency === 'biannual') {
            nextDueDate = addMonths(now, 6);
          } else if (plan.frequency === 'yearly') {
            nextDueDate = addYears(now, 1);
          } else if (plan.frequency === 'custom') {
            switch(plan.unit) {
              case 'days':
                nextDueDate = addDays(now, plan.interval);
                break;
              case 'weeks':
                nextDueDate = addWeeks(now, plan.interval);
                break;
              case 'months':
                nextDueDate = addMonths(now, plan.interval);
                break;
              case 'years':
                nextDueDate = addYears(now, plan.interval);
                break;
              default:
                nextDueDate = addDays(now, 30); // Default fallback
            }
          }
          
          // Update the maintenance plan's next due date and last performed date
          await supabase
            .from('maintenance_plans')
            .update({
              next_due_date: nextDueDate.toISOString(),
              last_performed_date: now.toISOString()
            })
            .eq('id', plan.id);
            
          // Create a new task based on the plan
          await supabase
            .from('maintenance_tasks')
            .insert({
              title: plan.title,
              notes: plan.description,
              equipment: task.equipment,
              equipment_id: task.equipment_id,
              due_date: nextDueDate.toISOString(),
              status: 'pending',
              priority: plan.priority,
              type: plan.type,
              assigned_to: plan.assigned_to
            });
        }
      } catch (planError) {
        console.error('Error updating maintenance plan:', planError);
        // We don't want to fail the task completion if plan update fails
        // Just log the error and continue
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error completing maintenance task ${id}:`, error);
    throw error;
  }
}

// Delete a maintenance task
export async function deleteTask(id: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error(`Error deleting maintenance task ${id}:`, error);
    throw error;
  }
}

// Get all maintenance plans
export async function getMaintenancePlans(): Promise<MaintenancePlan[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_plans')
      .select('*');

    if (error) throw error;

    // Map database results to our MaintenancePlan type
    if (data) {
      const plans: MaintenancePlan[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        equipmentId: item.equipment_id,
        equipmentName: item.equipment_name,
        frequency: item.frequency as MaintenanceFrequency,
        interval: item.interval,
        unit: item.unit as MaintenanceUnit,
        nextDueDate: new Date(item.next_due_date),
        lastPerformedDate: item.last_performed_date ? new Date(item.last_performed_date) : null,
        type: item.type as MaintenanceType,
        engineHours: item.engine_hours,
        active: item.active,
        priority: item.priority as MaintenancePriority,
        assignedTo: item.assigned_to
      }));
      
      return plans;
    }
    return [];
  } catch (error) {
    console.error('Error fetching maintenance plans:', error);
    throw error;
  }
}

// Get maintenance plans for a specific equipment
export async function getMaintenancePlansForEquipment(equipmentId: number): Promise<MaintenancePlan[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_plans')
      .select('*')
      .eq('equipment_id', equipmentId);

    if (error) throw error;

    // Map database results to our MaintenancePlan type
    if (data) {
      const plans: MaintenancePlan[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        equipmentId: item.equipment_id,
        equipmentName: item.equipment_name,
        frequency: item.frequency as MaintenanceFrequency,
        interval: item.interval,
        unit: item.unit as MaintenanceUnit,
        nextDueDate: new Date(item.next_due_date),
        lastPerformedDate: item.last_performed_date ? new Date(item.last_performed_date) : null,
        type: item.type as MaintenanceType,
        engineHours: item.engine_hours,
        active: item.active,
        priority: item.priority as MaintenancePriority,
        assignedTo: item.assigned_to
      }));
      
      return plans;
    }
    return [];
  } catch (error) {
    console.error(`Error fetching maintenance plans for equipment ${equipmentId}:`, error);
    throw error;
  }
}

// Add a new maintenance plan and first task
export async function addMaintenancePlan(plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan> {
  try {
    // First, insert the plan into maintenance_plans table
    const { data: planData, error: planError } = await supabase
      .from('maintenance_plans')
      .insert({
        title: plan.title,
        description: plan.description,
        equipment_id: plan.equipmentId,
        equipment_name: plan.equipmentName,
        frequency: plan.frequency,
        interval: plan.interval,
        unit: plan.unit,
        next_due_date: plan.nextDueDate.toISOString(),
        last_performed_date: plan.lastPerformedDate ? plan.lastPerformedDate.toISOString() : null,
        type: plan.type,
        engine_hours: plan.engineHours,
        active: plan.active,
        priority: plan.priority,
        assigned_to: plan.assignedTo
      })
      .select()
      .single();

    if (planError) throw planError;

    // Then, create the first maintenance task based on this plan
    const { error: taskError } = await supabase
      .from('maintenance_tasks')
      .insert({
        title: plan.title,
        notes: plan.description,
        equipment: plan.equipmentName,
        equipment_id: plan.equipmentId,
        due_date: plan.nextDueDate.toISOString(),
        status: 'pending',
        priority: plan.priority,
        type: plan.type,
        assigned_to: plan.assignedTo
      });

    if (taskError) {
      console.error('Warning: Failed to create initial task for maintenance plan:', taskError);
      // Continue even if task creation fails, just log warning
    }

    // Return the plan with its newly assigned ID
    return {
      ...plan,
      id: planData.id
    };
  } catch (error) {
    console.error('Error adding maintenance plan:', error);
    toast.error("Erreur lors de la création du plan de maintenance");
    throw error;
  }
}

// Update an existing maintenance plan
export async function updateMaintenancePlan(planId: number, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan | null> {
  try {
    // Convert any date objects to ISO strings for database storage
    const dbUpdates: any = { ...updates };
    if (updates.nextDueDate) {
      dbUpdates.next_due_date = updates.nextDueDate.toISOString();
      delete dbUpdates.nextDueDate;
    }
    if (updates.lastPerformedDate) {
      dbUpdates.last_performed_date = updates.lastPerformedDate.toISOString();
      delete dbUpdates.lastPerformedDate;
    }

    // Map our properties to database column names
    if (updates.equipmentId !== undefined) {
      dbUpdates.equipment_id = updates.equipmentId;
      delete dbUpdates.equipmentId;
    }
    if (updates.equipmentName !== undefined) {
      dbUpdates.equipment_name = updates.equipmentName;
      delete dbUpdates.equipmentName;
    }
    if (updates.engineHours !== undefined) {
      dbUpdates.engine_hours = updates.engineHours;
      delete dbUpdates.engineHours;
    }
    if (updates.assignedTo !== undefined) {
      dbUpdates.assigned_to = updates.assignedTo;
      delete dbUpdates.assignedTo;
    }

    const { data, error } = await supabase
      .from('maintenance_plans')
      .update(dbUpdates)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      // Map the response back to our MaintenancePlan type
      const updatedPlan: MaintenancePlan = {
        id: data.id,
        title: data.title,
        description: data.description,
        equipmentId: data.equipment_id,
        equipmentName: data.equipment_name,
        frequency: data.frequency as MaintenanceFrequency,
        interval: data.interval,
        unit: data.unit as MaintenanceUnit,
        nextDueDate: new Date(data.next_due_date),
        lastPerformedDate: data.last_performed_date ? new Date(data.last_performed_date) : null,
        type: data.type as MaintenanceType,
        engineHours: data.engine_hours,
        active: data.active,
        priority: data.priority as MaintenancePriority,
        assignedTo: data.assigned_to
      };
      return updatedPlan;
    }
    return null;
  } catch (error) {
    console.error(`Error updating maintenance plan ${planId}:`, error);
    toast.error("Erreur lors de la mise à jour du plan de maintenance");
    throw error;
  }
}

// Create a maintenance service for convenience
export const maintenanceService = {
  getTasks,
  getTasksForEquipment,
  addTask,
  updateTask,
  completeTask,
  deleteTask,
  getMaintenancePlans,
  getMaintenancePlansForEquipment,
  addMaintenancePlan,
  updateMaintenancePlan
};
