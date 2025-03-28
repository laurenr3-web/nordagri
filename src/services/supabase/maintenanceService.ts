
import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const maintenanceService = {
  // Get all tasks
  async getTasks(): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('maintenance_records')
      .select('*, equipments(name)');
    
    if (error) {
      console.error('Error fetching maintenance tasks:', error);
      throw error;
    }
    
    // Convert Supabase date strings to Date objects and ensure numeric values
    return (data || []).map(task => ({
      id: parseInt(task.id) || 0, // Convert string id to number
      title: task.description || '',
      equipment: task.equipments?.name || `Equipment ${task.equipment_id}`,
      equipmentId: task.equipment_id || '',
      type: (task.maintenance_type as MaintenanceType) || 'preventive',
      status: task.completed ? 'completed' as MaintenanceStatus : 'scheduled' as MaintenanceStatus,
      priority: ('medium' as MaintenancePriority), // Default priority
      dueDate: task.performed_at ? new Date(task.performed_at) : new Date(),
      completedDate: task.performed_at ? new Date(task.performed_at) : undefined,
      estimatedDuration: task.hours_at_maintenance ? Number(task.hours_at_maintenance) : 0,
      actualDuration: task.hours_at_maintenance ? Number(task.hours_at_maintenance) : undefined,
      assignedTo: task.technician_id || '',
      notes: task.description || ''
    }));
  },
  
  // Add a task
  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    console.log('Adding task to Supabase:', task);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    const supabaseTask = {
      description: task.title,
      equipment_id: task.equipmentId, // Now using string type for equipmentId
      maintenance_type: task.type,
      completed: task.status === 'completed',
      performed_at: task.completedDate ? task.completedDate.toISOString() : null,
      hours_at_maintenance: task.estimatedDuration || null,
      technician_id: task.assignedTo || session?.user?.id || null,
      cost: 0 // Default cost
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
      id: parseInt(data.id) || 0,
      title: data.description || '',
      equipment: `Equipment ${data.equipment_id}`,
      equipmentId: data.equipment_id || '',
      type: (data.maintenance_type as MaintenanceType) || 'preventive',
      status: data.completed ? 'completed' as MaintenanceStatus : 'scheduled' as MaintenanceStatus,
      priority: 'medium' as MaintenancePriority,
      dueDate: data.performed_at ? new Date(data.performed_at) : new Date(),
      completedDate: data.performed_at ? new Date(data.performed_at) : undefined,
      estimatedDuration: Number(data.hours_at_maintenance || 0),
      actualDuration: data.hours_at_maintenance ? Number(data.hours_at_maintenance) : undefined,
      assignedTo: data.technician_id || '',
      notes: data.description || ''
    };
  },
  
  // Update task status
  async updateTaskStatus(taskId: string, status: MaintenanceStatus): Promise<void> {
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
  
  // Update task priority
  async updateTaskPriority(taskId: string, priority: MaintenancePriority): Promise<void> {
    console.log('Updating task priority in Supabase:', taskId, priority);
    
    // Priority is not directly in the schema, so we'll skip this for now
    console.log('Warning: Priority update not implemented in current schema');
  },
  
  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
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
