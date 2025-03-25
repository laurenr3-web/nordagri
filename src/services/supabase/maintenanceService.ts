
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
    
    // Convert Supabase date strings to Date objects
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
      estimatedDuration: task.estimated_duration ? Number(task.estimated_duration) : 0,
      actualDuration: task.actual_duration ? Number(task.actual_duration) : undefined,
      assignedTo: task.assigned_to || '',
      notes: task.notes || ''
    }));
  },
  
  // Ajouter une tâche
  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    const supabaseTask = {
      title: task.title,
      equipment: task.equipment,
      equipment_id: task.equipmentId,
      type: task.type,
      status: task.status,
      priority: task.priority,
      due_date: task.dueDate.toISOString(),
      estimated_duration: Number(task.estimatedDuration),
      assigned_to: task.assignedTo || '',
      notes: task.notes,
      completed_date: task.completedDate ? task.completedDate.toISOString() : null,
      actual_duration: task.actualDuration ? Number(task.actualDuration) : null
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
      estimatedDuration: data.estimated_duration ? Number(data.estimated_duration) : 0,
      actualDuration: data.actual_duration ? Number(data.actual_duration) : undefined,
      assignedTo: data.assigned_to || '',
      notes: data.notes || ''
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
