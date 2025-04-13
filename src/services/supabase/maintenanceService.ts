
import { supabase } from '@/integrations/supabase/client';
import { 
  MaintenancePlan, 
  MaintenancePlanDB,
  MaintenanceTask, 
  MaintenanceTaskDB,
  MaintenanceFrequency, 
  MaintenanceType, 
  MaintenanceUnit, 
  MaintenancePriority, 
  MaintenanceStatus,
  MaintenanceFormValues 
} from '@/types/models/maintenance';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { toast } from 'sonner';
import { convertFromApi, convertToApi, safeEnumValue, safeDate } from '@/utils/typeTransformers';

// Get all maintenance tasks
export async function getTasks(): Promise<MaintenanceTask[]> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    
    // Convert database tasks to application model tasks
    return (data || []).map((task: MaintenanceTaskDB) => {
      return {
        id: task.id,
        title: task.title,
        equipment: task.equipment,
        equipmentId: task.equipment_id,
        type: safeEnumValue(task.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
        status: safeEnumValue(
          task.status, 
          ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
          'scheduled'
        ),
        priority: safeEnumValue(
          task.priority,
          ['low', 'medium', 'high', 'critical'] as const,
          'medium'
        ),
        dueDate: safeDate(task.due_date) || new Date(),
        completedDate: safeDate(task.completed_date),
        engineHours: task.engine_hours || 0,
        actualDuration: task.actual_duration,
        assignedTo: task.assigned_to || '',
        notes: task.notes || '',
        ownerId: task.owner_id
      };
    });
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
    
    // Convert database tasks to application model tasks
    return (data || []).map((task: MaintenanceTaskDB) => {
      return {
        id: task.id,
        title: task.title,
        equipment: task.equipment,
        equipmentId: task.equipment_id,
        type: safeEnumValue(task.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
        status: safeEnumValue(
          task.status, 
          ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
          'scheduled'
        ),
        priority: safeEnumValue(
          task.priority,
          ['low', 'medium', 'high', 'critical'] as const,
          'medium'
        ),
        dueDate: safeDate(task.due_date) || new Date(),
        completedDate: safeDate(task.completed_date),
        engineHours: task.engine_hours || 0,
        actualDuration: task.actual_duration,
        assignedTo: task.assigned_to || '',
        notes: task.notes || '',
        ownerId: task.owner_id
      };
    });
  } catch (error) {
    console.error(`Error fetching maintenance tasks for equipment ${equipmentId}:`, error);
    throw error;
  }
}

// Add a new maintenance task
export async function addTask(task: MaintenanceFormValues): Promise<MaintenanceTask> {
  try {
    // Convert form values to database format
    const taskData = convertToApi<MaintenanceTaskDB>({
      title: task.title,
      notes: task.notes,
      equipment: task.equipment,
      equipment_id: task.equipmentId,
      due_date: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate,
      status: task.status || 'pending',
      priority: task.priority,
      type: task.type,
      estimated_duration: task.engineHours,
      assigned_to: task.assignedTo || ''
    });

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert(taskData)
      .select()
      .single();

    if (error) throw error;
    
    // Convert to application model format
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      type: safeEnumValue(data.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
      status: safeEnumValue(
        data.status, 
        ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
        'scheduled'
      ),
      priority: safeEnumValue(
        data.priority,
        ['low', 'medium', 'high', 'critical'] as const,
        'medium'
      ),
      dueDate: safeDate(data.due_date) || new Date(),
      completedDate: safeDate(data.completed_date),
      engineHours: data.engine_hours || 0,
      actualDuration: data.actual_duration,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      ownerId: data.owner_id
    };
  } catch (error) {
    console.error('Error adding maintenance task:', error);
    throw error;
  }
}

// Update a maintenance task
export async function updateTask(id: number, updates: Partial<MaintenanceTask>): Promise<MaintenanceTask> {
  try {
    // Convert to database format
    const dbUpdates = convertToApi(updates);
    
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Convert to application model format
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      type: safeEnumValue(data.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
      status: safeEnumValue(
        data.status, 
        ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
        'scheduled'
      ),
      priority: safeEnumValue(
        data.priority,
        ['low', 'medium', 'high', 'critical'] as const,
        'medium'
      ),
      dueDate: safeDate(data.due_date) || new Date(),
      completedDate: safeDate(data.completed_date),
      engineHours: data.engine_hours || 0,
      actualDuration: data.actual_duration,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      ownerId: data.owner_id
    };
  } catch (error) {
    console.error(`Error updating maintenance task ${id}:`, error);
    throw error;
  }
}

// Update task status
export async function updateTaskStatus(id: number, status: MaintenanceStatus): Promise<MaintenanceTask> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Convert to application model format
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      type: safeEnumValue(data.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
      status: safeEnumValue(
        data.status, 
        ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
        'scheduled'
      ),
      priority: safeEnumValue(
        data.priority,
        ['low', 'medium', 'high', 'critical'] as const,
        'medium'
      ),
      dueDate: safeDate(data.due_date) || new Date(),
      completedDate: safeDate(data.completed_date),
      engineHours: data.engine_hours || 0,
      actualDuration: data.actual_duration,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      ownerId: data.owner_id
    };
  } catch (error) {
    console.error(`Error updating status for task ${id}:`, error);
    throw error;
  }
}

// Update task priority
export async function updateTaskPriority(id: number, priority: MaintenancePriority): Promise<MaintenanceTask> {
  try {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .update({ priority })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    // Convert to application model format
    return {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      type: safeEnumValue(data.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
      status: safeEnumValue(
        data.status, 
        ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
        'scheduled'
      ),
      priority: safeEnumValue(
        data.priority,
        ['low', 'medium', 'high', 'critical'] as const,
        'medium'
      ),
      dueDate: safeDate(data.due_date) || new Date(),
      completedDate: safeDate(data.completed_date),
      engineHours: data.engine_hours || 0,
      actualDuration: data.actual_duration,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      ownerId: data.owner_id
    };
  } catch (error) {
    console.error(`Error updating priority for task ${id}:`, error);
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
    
    // Convert to application model format
    const task = {
      id: data.id,
      title: data.title,
      equipment: data.equipment,
      equipmentId: data.equipment_id,
      type: safeEnumValue(data.type, ['preventive', 'corrective', 'condition-based'] as const, 'preventive'),
      status: safeEnumValue(
        data.status, 
        ['scheduled', 'in-progress', 'completed', 'overdue', 'cancelled', 'pending-parts'] as const, 
        'scheduled'
      ),
      priority: safeEnumValue(
        data.priority,
        ['low', 'medium', 'high', 'critical'] as const,
        'medium'
      ),
      dueDate: safeDate(data.due_date) || new Date(),
      completedDate: safeDate(data.completed_date),
      engineHours: data.engine_hours || 0,
      actualDuration: data.actual_duration,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      ownerId: data.owner_id
    };
    
    // Find associated maintenance plan if exists and update next due date
    if (task) {
      try {
        // Check if this task is part of a maintenance plan
        const { data: planData } = await supabase
          .from('maintenance_plans')
          .select('*')
          .eq('equipment_id', task.equipmentId)
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
              equipment_id: task.equipmentId,
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
    
    return task;
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
      return data.map((item: MaintenancePlanDB) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          equipmentId: item.equipment_id,
          equipmentName: item.equipment_name,
          frequency: safeEnumValue(
            item.frequency, 
            ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'biannual', 'yearly', 'custom', 'other'] as const,
            'monthly'
          ),
          interval: item.interval,
          unit: safeEnumValue(
            item.unit, 
            ['hours', 'days', 'weeks', 'months', 'years', 'other'] as const,
            'days'
          ),
          nextDueDate: safeDate(item.next_due_date) || new Date(),
          lastPerformedDate: item.last_performed_date ? safeDate(item.last_performed_date) : null,
          type: safeEnumValue(
            item.type, 
            ['preventive', 'corrective', 'condition-based'] as const,
            'preventive'
          ),
          engineHours: item.engine_hours,
          active: item.active,
          priority: safeEnumValue(
            item.priority, 
            ['low', 'medium', 'high', 'critical'] as const,
            'medium'
          ),
          assignedTo: item.assigned_to
        };
      });
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
      return data.map((item: MaintenancePlanDB) => {
        return {
          id: item.id,
          title: item.title,
          description: item.description,
          equipmentId: item.equipment_id,
          equipmentName: item.equipment_name,
          frequency: safeEnumValue(
            item.frequency, 
            ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'biannual', 'yearly', 'custom', 'other'] as const,
            'monthly'
          ),
          interval: item.interval,
          unit: safeEnumValue(
            item.unit, 
            ['hours', 'days', 'weeks', 'months', 'years', 'other'] as const,
            'days'
          ),
          nextDueDate: safeDate(item.next_due_date) || new Date(),
          lastPerformedDate: item.last_performed_date ? safeDate(item.last_performed_date) : null,
          type: safeEnumValue(
            item.type, 
            ['preventive', 'corrective', 'condition-based'] as const,
            'preventive'
          ),
          engineHours: item.engine_hours,
          active: item.active,
          priority: safeEnumValue(
            item.priority, 
            ['low', 'medium', 'high', 'critical'] as const,
            'medium'
          ),
          assignedTo: item.assigned_to
        };
      });
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
    // Convert to database format
    const planDbData = {
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
    };

    // First, insert the plan into maintenance_plans table
    const { data: planData, error: planError } = await supabase
      .from('maintenance_plans')
      .insert(planDbData)
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
    const dbUpdates: any = { };
    
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    
    if (updates.nextDueDate !== undefined) {
      dbUpdates.next_due_date = updates.nextDueDate.toISOString();
    }
    
    if (updates.lastPerformedDate !== undefined) {
      dbUpdates.last_performed_date = updates.lastPerformedDate instanceof Date 
        ? updates.lastPerformedDate.toISOString() 
        : null;
    }
    
    if (updates.equipmentId !== undefined) {
      dbUpdates.equipment_id = updates.equipmentId;
    }
    
    if (updates.equipmentName !== undefined) {
      dbUpdates.equipment_name = updates.equipmentName;
    }
    
    if (updates.engineHours !== undefined) {
      dbUpdates.engine_hours = updates.engineHours;
    }
    
    if (updates.assignedTo !== undefined) {
      dbUpdates.assigned_to = updates.assignedTo;
    }
    
    if (updates.frequency !== undefined) dbUpdates.frequency = updates.frequency;
    if (updates.interval !== undefined) dbUpdates.interval = updates.interval;
    if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.active !== undefined) dbUpdates.active = updates.active;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;

    const { data, error } = await supabase
      .from('maintenance_plans')
      .update(dbUpdates)
      .eq('id', planId)
      .select()
      .single();

    if (error) throw error;

    if (data) {
      // Map the response back to our MaintenancePlan type
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        equipmentId: data.equipment_id,
        equipmentName: data.equipment_name,
        frequency: safeEnumValue(
          data.frequency, 
          ['daily', 'weekly', 'monthly', 'quarterly', 'semi-annual', 'annual', 'biannual', 'yearly', 'custom', 'other'] as const,
          'monthly'
        ),
        interval: data.interval,
        unit: safeEnumValue(
          data.unit, 
          ['hours', 'days', 'weeks', 'months', 'years', 'other'] as const,
          'days'
        ),
        nextDueDate: safeDate(data.next_due_date) || new Date(),
        lastPerformedDate: data.last_performed_date ? safeDate(data.last_performed_date) : null,
        type: safeEnumValue(
          data.type, 
          ['preventive', 'corrective', 'condition-based'] as const,
          'preventive'
        ),
        engineHours: data.engine_hours,
        active: data.active,
        priority: safeEnumValue(
          data.priority, 
          ['low', 'medium', 'high', 'critical'] as const,
          'medium'
        ),
        assignedTo: data.assigned_to
      };
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
  updateTaskStatus,
  updateTaskPriority,
  completeTask,
  deleteTask,
  getMaintenancePlans,
  getMaintenancePlansForEquipment,
  addMaintenancePlan,
  updateMaintenancePlan
};
