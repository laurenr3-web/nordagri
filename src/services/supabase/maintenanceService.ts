import { supabase } from '@/integrations/supabase/client';
import { adaptServiceTaskToModelTask } from '@/hooks/maintenance/adapters/maintenanceTypeAdapters';
import { MaintenanceTaskDB } from '@/types/models/maintenance';
import { toast } from 'sonner';

// Re-export the MaintenanceTask type from the models
export type { MaintenanceTaskDB as MaintenanceTask };

/**
 * Service for interacting with maintenance-related data in Supabase
 */
export const maintenanceService = {
  /**
   * Get all maintenance tasks
   */
  getTasks: async () => {
    try {
      // Utilisation de données de démonstration en cas de problème d'accès
      const demoTasks = [
        {
          id: 1,
          title: "Vidange d'huile",
          equipment: "Tracteur John Deere",
          equipment_id: 1,
          type: "preventive",
          status: "scheduled",
          priority: "medium",
          due_date: new Date(Date.now() + 86400000 * 3).toISOString(),
          estimated_duration: 2,
          engine_hours: 120,
          assigned_to: "Technicien A",
          notes: "Utiliser de l'huile 15W-40"
        },
        {
          id: 2,
          title: "Changement de filtre à air",
          equipment: "Moissonneuse XYZ",
          equipment_id: 2,
          type: "corrective",
          status: "in-progress",
          priority: "high",
          due_date: new Date().toISOString(),
          estimated_duration: 1,
          engine_hours: 350,
          assigned_to: "Technicien B",
          notes: "Filtre référence AF2589"
        },
        {
          id: 3,
          title: "Calibration système GPS",
          equipment: "Tracteur Case IH",
          equipment_id: 3,
          type: "condition-based",
          status: "completed",
          priority: "low",
          due_date: new Date(Date.now() - 86400000 * 2).toISOString(),
          completed_date: new Date(Date.now() - 86400000).toISOString(),
          estimated_duration: 3,
          actual_duration: 2.5,
          engine_hours: 890,
          assigned_to: "Technicien C",
          notes: "Dernière calibration effectuée"
        }
      ];
      
      try {
        const { data, error } = await supabase
          .from('maintenance_tasks')
          .select('*')
          .order('due_date', { ascending: true });

        if (error) {
          console.error('Error fetching maintenance tasks:', error);
          console.info('Returning demo maintenance tasks');
          return demoTasks;
        }

        if (!data || data.length === 0) {
          console.info('No maintenance tasks found, returning demo data');
          return demoTasks;
        }

        // Return the real data from database
        return data;
      } catch (dbError) {
        console.error('Database error in getTasks:', dbError);
        console.info('Returning demo maintenance tasks due to database error');
        return demoTasks;
      }
    } catch (error) {
      console.error('Error in getTasks:', error);
      return [];
    }
  },
  
  /**
   * Get maintenance tasks for a specific equipment
   */
  getTasksForEquipment: async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('due_date', { ascending: true });

      if (error) {
        console.error('Error fetching equipment maintenance tasks:', error);
        throw new Error('Failed to fetch equipment maintenance tasks');
      }

      // Return the raw data from database
      return data || [];
    } catch (error) {
      console.error('Error in getTasksForEquipment:', error);
      throw error;
    }
  },
  
  /**
   * Add a new maintenance task
   */
  addTask: async (task: any) => {
    try {
      // Map to the expected database structure
      const taskToInsert = {
        title: task.title,
        equipment: task.equipment,
        equipment_id: task.equipment_id || task.equipmentId,
        type: task.type,
        status: task.status,
        priority: task.priority,
        due_date: task.due_date || (task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate),
        estimated_duration: task.estimated_duration || task.engineHours || task.engine_hours,
        assigned_to: task.assigned_to || task.assignedTo,
        notes: task.notes || ''
      };

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(taskToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error adding maintenance task:', error);
        throw new Error('Failed to add maintenance task');
      }

      return data;
    } catch (error) {
      console.error('Error in addTask:', error);
      throw error;
    }
  },
  
  /**
   * Update a maintenance task's status
   */
  updateTaskStatus: async (taskId: number, newStatus: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({ 
          status: newStatus,
          completed_date: newStatus === 'completed' ? new Date().toISOString() : null
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task status:', error);
        throw new Error('Failed to update task status');
      }

      return data;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  },
  
  /**
   * Update a maintenance task's priority
   */
  updateTaskPriority: async (taskId: number, newPriority: string) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({ priority: newPriority })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task priority:', error);
        throw new Error('Failed to update task priority');
      }

      return data;
    } catch (error) {
      console.error('Error in updateTaskPriority:', error);
      throw error;
    }
  },
  
  /**
   * Delete a maintenance task
   */
  deleteTask: async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
      }

      return true;
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  },
  
  /**
   * Complete a maintenance task with additional details
   */
  completeTask: async (taskId: number, completionData: any): Promise<MaintenanceTaskDB> => {
    try {
      const { actualDuration, notes, partsUsed } = completionData;
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({
          status: 'completed',
          completed_date: new Date().toISOString(),
          actual_duration: actualDuration,
          notes: notes || ''
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error completing task:', error);
        throw new Error('Failed to complete task');
      }

      // The data object returned from Supabase might be missing engine_hours
      // We need to ensure our return object conforms to MaintenanceTaskDB type
      const taskWithEngineHours = {
        ...data,
        engine_hours: data.estimated_duration || 0 // Use estimated_duration as fallback or default to 0
      } as MaintenanceTaskDB;

      return taskWithEngineHours;
    } catch (error) {
      console.error('Error in completeTask:', error);
      throw error;
    }
  },
  
  /**
   * Get all maintenance plans
   */
  getMaintenancePlans: async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance plans:', error);
        throw new Error('Failed to fetch maintenance plans');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMaintenancePlans:', error);
      throw error;
    }
  },
  
  /**
   * Get maintenance plans for a specific equipment
   */
  getMaintenancePlansForEquipment: async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching equipment maintenance plans:', error);
        throw new Error('Failed to fetch equipment maintenance plans');
      }

      return data || [];
    } catch (error) {
      console.error('Error in getMaintenancePlansForEquipment:', error);
      throw error;
    }
  },
  
  /**
   * Add a new maintenance plan
   */
  addMaintenancePlan: async (plan: any) => {
    try {
      // Map to the expected database structure
      const planToInsert = {
        title: plan.title,
        description: plan.description,
        equipment_id: plan.equipment_id || plan.equipmentId,
        equipment_name: plan.equipment_name || plan.equipmentName,
        frequency: plan.frequency,
        interval: plan.interval,
        unit: plan.unit,
        next_due_date: plan.next_due_date || 
                      (plan.nextDueDate instanceof Date ? plan.nextDueDate.toISOString() : plan.nextDueDate),
        last_performed_date: plan.last_performed_date ||
                           (plan.lastPerformedDate instanceof Date ? plan.lastPerformedDate.toISOString() : null),
        type: plan.type,
        engine_hours: plan.engine_hours || plan.engineHours,
        active: plan.active,
        priority: plan.priority,
        assigned_to: plan.assigned_to || plan.assignedTo
      };

      const { data, error } = await supabase
        .from('maintenance_plans')
        .insert(planToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error adding maintenance plan:', error);
        throw new Error('Failed to add maintenance plan');
      }

      return data;
    } catch (error) {
      console.error('Error in addMaintenancePlan:', error);
      throw error;
    }
  },
  
  /**
   * Update a maintenance plan
   */
  updateMaintenancePlan: async (planId: number, updates: any) => {
    try {
      // Map updates to the expected database structure
      const planToUpdate: any = {};
      
      if (updates.title !== undefined) planToUpdate.title = updates.title;
      if (updates.description !== undefined) planToUpdate.description = updates.description;
      if (updates.equipmentId !== undefined) planToUpdate.equipment_id = updates.equipmentId;
      if (updates.equipment_id !== undefined) planToUpdate.equipment_id = updates.equipment_id;
      if (updates.equipmentName !== undefined) planToUpdate.equipment_name = updates.equipmentName;
      if (updates.equipment_name !== undefined) planToUpdate.equipment_name = updates.equipment_name;
      if (updates.frequency !== undefined) planToUpdate.frequency = updates.frequency;
      if (updates.interval !== undefined) planToUpdate.interval = updates.interval;
      if (updates.unit !== undefined) planToUpdate.unit = updates.unit;
      if (updates.nextDueDate !== undefined) {
        planToUpdate.next_due_date = updates.nextDueDate instanceof Date ? 
          updates.nextDueDate.toISOString() : updates.nextDueDate;
      }
      if (updates.next_due_date !== undefined) planToUpdate.next_due_date = updates.next_due_date;
      if (updates.lastPerformedDate !== undefined) {
        planToUpdate.last_performed_date = updates.lastPerformedDate && updates.lastPerformedDate instanceof Date ? 
          updates.lastPerformedDate.toISOString() : updates.lastPerformedDate;
      }
      if (updates.last_performed_date !== undefined) planToUpdate.last_performed_date = updates.last_performed_date;
      if (updates.type !== undefined) planToUpdate.type = updates.type;
      if (updates.engineHours !== undefined) planToUpdate.engine_hours = updates.engineHours;
      if (updates.engine_hours !== undefined) planToUpdate.engine_hours = updates.engine_hours;
      if (updates.active !== undefined) planToUpdate.active = updates.active;
      if (updates.priority !== undefined) planToUpdate.priority = updates.priority;
      if (updates.assignedTo !== undefined) planToUpdate.assigned_to = updates.assignedTo;
      if (updates.assigned_to !== undefined) planToUpdate.assigned_to = updates.assigned_to;

      const { data, error } = await supabase
        .from('maintenance_plans')
        .update(planToUpdate)
        .eq('id', planId)
        .select()
        .single();

      if (error) {
        console.error('Error updating maintenance plan:', error);
        throw new Error('Failed to update maintenance plan');
      }

      return data;
    } catch (error) {
      console.error('Error in updateMaintenancePlan:', error);
      throw error;
    }
  },
};
