
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const maintenanceService = {
  // Récupérer toutes les tâches
  async getTasks(): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*');
    
    if (error) {
      console.error('Error fetching maintenance tasks:', error);
      throw error;
    }
    
    // Convert Supabase date strings to Date objects and ensure numeric values
    return (data || []).map(task => ({
      id: task.id,
      title: task.description || '',
      equipment: task.equipment_name || '',
      equipmentId: task.equipment_id,
      type: task.maintenance_type as MaintenanceType,
      status: task.completed ? 'completed' as MaintenanceStatus : 'pending' as MaintenanceStatus,
      priority: task.priority as MaintenancePriority || 'medium',
      dueDate: task.scheduled_date ? new Date(task.scheduled_date) : new Date(),
      completedDate: task.performed_at ? new Date(task.performed_at) : undefined,
      estimatedDuration: task.estimated_hours ? Number(task.estimated_hours) : 0,
      actualDuration: task.hours_spent ? Number(task.hours_spent) : undefined,
      assignedTo: task.technician_id || '',
      notes: task.notes || ''
    }));
  },
  
  // Ajouter une tâche
  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    console.log('Adding task to Supabase:', task);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const supabaseTask = {
      description: task.title,
      equipment_name: task.equipment,
      equipment_id: task.equipmentId,
      maintenance_type: task.type,
      completed: task.status === 'completed',
      priority: task.priority,
      scheduled_date: task.dueDate.toISOString(),
      estimated_hours: task.estimatedDuration,
      technician_id: task.assignedTo || session?.user?.id || null,
      notes: task.notes,
      performed_at: task.completedDate ? task.completedDate.toISOString() : null,
      hours_spent: task.actualDuration || null
    };
    
    const { data, error } = await supabase
      .from('maintenance_records')
      .insert(supabaseTask)
      .select()
      .single();
    
    if (error) {
      console.error('Error adding maintenance task:', error);
      throw error;
    }
    
    return {
      id: data.id,
      title: data.description || '',
      equipment: data.equipment_name || '',
      equipmentId: data.equipment_id,
      type: data.maintenance_type as MaintenanceType,
      status: data.completed ? 'completed' as MaintenanceStatus : 'pending' as MaintenanceStatus,
      priority: data.priority as MaintenancePriority,
      dueDate: new Date(data.scheduled_date || new Date()),
      completedDate: data.performed_at ? new Date(data.performed_at) : undefined,
      estimatedDuration: Number(data.estimated_hours || 0),
      actualDuration: data.hours_spent ? Number(data.hours_spent) : undefined,
      assignedTo: data.technician_id || '',
      notes: data.notes || ''
    };
  },
  
  // Mettre à jour le statut d'une tâche
  async updateTaskStatus(taskId: number | string, status: MaintenanceStatus): Promise<void> {
    console.log('Updating task status in Supabase:', taskId, status);
    
    const updates = { 
      completed: status === 'completed',
      performed_at: status === 'completed' ? new Date().toISOString() : null
    };
    
    const { error } = await supabase
      .from('maintenance_records')
      .update(updates)
      .eq('id', taskId);
    
    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },
  
  // Mettre à jour la priorité d'une tâche
  async updateTaskPriority(taskId: number | string, priority: MaintenancePriority): Promise<void> {
    console.log('Updating task priority in Supabase:', taskId, priority);
    
    const { error } = await supabase
      .from('maintenance_records')
      .update({ priority })
      .eq('id', taskId);
    
    if (error) {
      console.error('Error updating task priority:', error);
      throw error;
    }
  },
  
  // Supprimer une tâche
  async deleteTask(taskId: number | string): Promise<void> {
    console.log('Deleting task from Supabase:', taskId);
    
    const { error } = await supabase
      .from('maintenance_records')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }
};
