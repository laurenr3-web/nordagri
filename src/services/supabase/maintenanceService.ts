import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';

class MaintenanceService {
  async getTasks(): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch maintenance tasks');
    }

    return data.map(task => ({
      id: task.id,
      title: task.title,
      equipment: task.equipment,
      equipmentId: task.equipment_id,
      type: task.type as MaintenanceType,
      status: task.status as MaintenanceStatus,
      priority: task.priority as MaintenancePriority,
      dueDate: new Date(task.due_date),
      completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
      engineHours: task.estimated_duration || 0,
      actualDuration: task.actual_duration,
      assignedTo: task.assigned_to || '',
      notes: task.notes || '',
      trigger_unit: task.trigger_unit,
      trigger_hours: task.trigger_hours,
      trigger_kilometers: task.trigger_kilometers,
    }));
  }

  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert([{
        title: task.title,
        equipment: task.equipment,
        equipment_id: task.equipmentId,
        type: task.type,
        status: 'scheduled',
        priority: task.priority,
        due_date: task.dueDate,
        estimated_duration: task.engineHours,
        assigned_to: task.assignedTo,
        notes: task.notes,
        trigger_unit: task.trigger_unit,
        trigger_hours: task.trigger_hours,
        trigger_kilometers: task.trigger_kilometers,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add maintenance task');
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
      engineHours: data.estimated_duration || 0,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      trigger_unit: data.trigger_unit,
      trigger_hours: data.trigger_hours,
      trigger_kilometers: data.trigger_kilometers,
    };
  }

  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
  }

  async updateTaskPriority(taskId: number, priority: MaintenancePriority): Promise<void> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ priority })
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task priority:', error);
      throw new Error('Failed to update task priority');
    }
  }

  async deleteTask(taskId: number): Promise<void> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      throw new Error('Failed to delete task');
    }
  }

  async getTasksForEquipment(equipmentId: number): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('equipment_id', equipmentId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks for equipment:', error);
      throw new Error('Failed to fetch maintenance tasks for equipment');
    }

    return data.map(task => ({
      id: task.id,
      title: task.title,
      equipment: task.equipment,
      equipmentId: task.equipment_id,
      type: task.type as MaintenanceType,
      status: task.status as MaintenanceStatus,
      priority: task.priority as MaintenancePriority,
      dueDate: new Date(task.due_date),
      completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
      engineHours: task.estimated_duration || 0,
      actualDuration: task.actual_duration,
      assignedTo: task.assigned_to || '',
      notes: task.notes || '',
      trigger_unit: task.trigger_unit,
      trigger_hours: task.trigger_hours,
      trigger_kilometers: task.trigger_kilometers,
    }));
  }
}

export const maintenanceService = new MaintenanceService();
