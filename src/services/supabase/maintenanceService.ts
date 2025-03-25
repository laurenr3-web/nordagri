
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';

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
    
    // Convert Supabase date strings to Date objects
    return (data || []).map(task => ({
      ...task,
      dueDate: task.due_date ? new Date(task.due_date) : new Date(),
      completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
      estimatedDuration: task.estimated_duration?.toString() || '0',
      actualDuration: task.actual_duration?.toString(),
      id: task.id
    }));
  },
  
  // Ajouter une tâche
  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    const supabaseTask = {
      title: task.title,
      equipment: task.equipment,
      equipment_id: 1, // Default value if not provided
      type: task.type,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate.toISOString(),
      estimated_duration: parseFloat(task.estimatedDuration),
      assigned_to: task.assignedTo,
      notes: task.notes,
      completed_date: task.completedDate ? task.completedDate.toISOString() : null,
      actual_duration: task.actualDuration ? parseFloat(task.actualDuration) : null
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
      ...data,
      dueDate: new Date(data.due_date),
      completedDate: data.completed_date ? new Date(data.completed_date) : undefined,
      estimatedDuration: data.estimated_duration?.toString() || '0',
      actualDuration: data.actual_duration?.toString(),
      id: data.id
    };
  },
  
  // Mettre à jour le statut d'une tâche
  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
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
