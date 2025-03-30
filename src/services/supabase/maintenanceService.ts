
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const maintenanceService = {
  // Récupérer toutes les tâches
  async getTasks(): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*');
    
    if (error) {
      console.error('Error fetching maintenance tasks:', error);
      throw error;
    }
    
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
      engineHours: task.engine_hours ? Number(task.engine_hours) : 0,
      actualDuration: task.actual_duration ? Number(task.actual_duration) : undefined,
      assignedTo: task.assigned_to || '',
      notes: task.notes || ''
    }));
  },
  
  // Ajouter une tâche
  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    console.log('Adding task to Supabase:', task);
    
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
      engine_hours: task.engineHours,
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
      engineHours: Number(data.engine_hours),
      actualDuration: data.actual_duration ? Number(data.actual_duration) : undefined,
      assignedTo: data.assigned_to || '',
      notes: data.notes || ''
    };
  },
  
  // Mettre à jour le statut d'une tâche
  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
    console.log('Updating task status in Supabase:', taskId, status);
    
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
  },
  
  // Mettre à jour la priorité d'une tâche
  async updateTaskPriority(taskId: number, priority: MaintenancePriority): Promise<void> {
    console.log('Updating task priority in Supabase:', taskId, priority);
    
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ priority })
      .eq('id', taskId);
    
    if (error) {
      console.error('Error updating task priority:', error);
      throw error;
    }
  },
  
  // Supprimer une tâche
  async deleteTask(taskId: number): Promise<void> {
    console.log('Deleting task from Supabase:', taskId);
    
    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};
