
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const maintenanceService = {
  // Récupérer toutes les tâches
  async getTasks(): Promise<MaintenanceTask[]> {
    console.log('Fetching all maintenance tasks...');
    
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching maintenance tasks:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} maintenance tasks`);
      
      // Convert Supabase date strings to Date objects and ensure numeric values
      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        equipment: task.equipment,
        equipmentId: task.equipment_id,
        type: task.type as MaintenanceType,
        status: task.status as MaintenanceStatus,
        priority: task.priority as MaintenancePriority,
        dueDate: task.due_date ? new Date(task.due_date) : new Date(),
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        // Map estimated_duration from database to engineHours in our model
        engineHours: task.estimated_duration ? Number(task.estimated_duration) : 0,
        actualDuration: task.actual_duration ? Number(task.actual_duration) : undefined,
        assignedTo: task.assigned_to || '',
        notes: task.notes || ''
      }));
    } catch (error) {
      console.error('Error in getTasks:', error);
      throw error;
    }
  },
  
  // Ajouter une tâche
  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    console.log('Adding task to Supabase:', task);
    
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw sessionError;
      }
      
      const supabaseTask = {
        title: task.title,
        equipment: task.equipment,
        equipment_id: task.equipmentId,
        type: task.type,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate.toISOString(),
        // Map engineHours to estimated_duration for database storage
        estimated_duration: task.engineHours,
        assigned_to: task.assignedTo || '',
        notes: task.notes,
        completed_date: task.completedDate ? task.completedDate.toISOString() : null,
        actual_duration: task.actualDuration || null,
        owner_id: sessionData.session?.user.id
      };
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(supabaseTask)
        .select()
        .single();
      
      if (error) {
        console.error('Error adding maintenance task:', error);
        throw error;
      }
      
      return {
        id: data.id,
        title: data.title,
        equipment: data.equipment,
        equipmentId: data.equipment_id,
        type: data.type as MaintenanceType,
        status: data.status as MaintenanceStatus,
        priority: data.priority as MaintenancePriority,
        dueDate: new Date(data.due_date),
        completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
        // Map estimated_duration from database to engineHours in our model
        engineHours: Number(data.estimated_duration),
        actualDuration: data.actual_duration ? Number(data.actual_duration) : undefined,
        assignedTo: data.assigned_to || '',
        notes: data.notes || ''
      };
    } catch (error) {
      console.error('Error in addTask:', error);
      throw error;
    }
  },
  
  // Mettre à jour le statut d'une tâche
  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
    console.log('Updating task status in Supabase:', taskId, status);
    
    try {
      const updates = { 
        status,
        ...(status === 'completed' ? { completed_date: new Date().toISOString() } : {})
      };
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
      
      console.log(`Successfully updated task ${taskId} status to ${status}`);
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  },
  
  // Mettre à jour la priorité d'une tâche
  async updateTaskPriority(taskId: number, priority: MaintenancePriority): Promise<void> {
    console.log('Updating task priority in Supabase:', taskId, priority);
    
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({ priority })
        .eq('id', taskId);
      
      if (error) {
        console.error('Error updating task priority:', error);
        throw error;
      }
      
      console.log(`Successfully updated task ${taskId} priority to ${priority}`);
    } catch (error) {
      console.error('Error in updateTaskPriority:', error);
      throw error;
    }
  },
  
  // Supprimer une tâche
  async deleteTask(taskId: number): Promise<void> {
    console.log('Deleting task from Supabase:', taskId);
    
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
      
      console.log(`Successfully deleted task ${taskId}`);
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  },
  
  // Compléter une tâche de maintenance avec des informations supplémentaires
  async completeTask(taskId: number, completionData: { 
    completedDate: Date; 
    actualDuration: number; 
    notes?: string;
    technician?: string;
  }): Promise<void> {
    console.log('Completing task in Supabase:', taskId, completionData);
    
    try {
      const updates = {
        status: 'completed' as MaintenanceStatus,
        completed_date: completionData.completedDate.toISOString(),
        actual_duration: completionData.actualDuration,
        notes: completionData.notes,
        assigned_to: completionData.technician
      };
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) {
        console.error('Error completing task:', error);
        throw error;
      }
      
      console.log(`Successfully completed task ${taskId}`);
    } catch (error) {
      console.error('Error in completeTask:', error);
      throw error;
    }
  },
  
  // Récupérer les tâches pour un équipement spécifique
  async getTasksForEquipment(equipmentId: number): Promise<MaintenanceTask[]> {
    console.log(`Fetching maintenance tasks for equipment ID ${equipmentId}...`);
    
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching equipment maintenance tasks:', error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} maintenance tasks for equipment ${equipmentId}`);
      
      // Convert Supabase date strings to Date objects and ensure numeric values
      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        equipment: task.equipment,
        equipmentId: task.equipment_id,
        type: task.type as MaintenanceType,
        status: task.status as MaintenanceStatus,
        priority: task.priority as MaintenancePriority,
        dueDate: task.due_date ? new Date(task.due_date) : new Date(),
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        engineHours: Number(task.estimated_duration || 0),
        actualDuration: task.actual_duration ? Number(task.actual_duration) : undefined,
        assignedTo: task.assigned_to || '',
        notes: task.notes || ''
      }));
    } catch (error) {
      console.error(`Error in getTasksForEquipment (${equipmentId}):`, error);
      throw error;
    }
  }
};
