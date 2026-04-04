import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';

export class MaintenanceTasksService {
  private mapTaskFromDb(task: any): MaintenanceTask {
    return {
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
      completed_at_hours: task.completed_at_hours,
      completed_at_km: task.completed_at_km,
      is_recurrent: task.is_recurrent || false,
      recurrence_interval: task.recurrence_interval,
      recurrence_unit: task.recurrence_unit,
      equipment_current_value: task.equipment?.valeur_actuelle ?? undefined,
    };
  }

  async getTasks(): Promise<MaintenanceTask[]> {
    const { data, error } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
      throw new Error('Failed to fetch maintenance tasks');
    }

    return data.map(task => this.mapTaskFromDb(task));
  }

  async addTask(task: Omit<MaintenanceTask, 'id'>): Promise<MaintenanceTask> {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    
    if (!currentUserId) {
      throw new Error('You must be logged in to add maintenance tasks');
    }
    
    const insertData: any = {
      title: task.title,
      equipment: task.equipment,
      equipment_id: task.equipmentId,
      type: task.type,
      status: task.status || 'scheduled',
      priority: task.priority,
      due_date: task.dueDate.toISOString(),
      estimated_duration: task.engineHours,
      assigned_to: task.assignedTo,
      notes: task.notes,
      trigger_unit: task.trigger_unit,
      trigger_hours: task.trigger_hours,
      trigger_kilometers: task.trigger_kilometers,
      owner_id: currentUserId,
      is_recurrent: task.is_recurrent || false,
      recurrence_interval: task.recurrence_interval || null,
      recurrence_unit: task.recurrence_unit || null,
    };

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw new Error('Failed to add maintenance task: ' + error.message);
    }

    if (!data) {
      throw new Error('No data returned after task creation');
    }

    return this.mapTaskFromDb(data);
  }

  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) {
      throw new Error('Failed to update task status');
    }
  }

  async updateTaskPriority(taskId: number, priority: MaintenancePriority): Promise<void> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .update({ priority })
      .eq('id', taskId);

    if (error) {
      throw new Error('Failed to update task priority');
    }
  }

  async deleteTask(taskId: number): Promise<void> {
    const { error } = await supabase
      .from('maintenance_tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
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
      throw new Error('Failed to fetch maintenance tasks for equipment');
    }

    return data.map(task => this.mapTaskFromDb(task));
  }

  async completeTask(taskId: number, completionData: {
    completedDate?: Date;
    actualDuration?: number;
    notes?: string;
    technician?: string;
    completedAtHours?: number;
    completedAtKm?: number;
  }): Promise<void> {
    // Fetch the task to check recurrence info
    const { data: taskData } = await supabase
      .from('maintenance_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    const updateData: any = {
      status: 'completed',
      completed_date: completionData.completedDate ? completionData.completedDate.toISOString() : new Date().toISOString()
    };

    if (completionData.actualDuration !== undefined) {
      updateData.actual_duration = completionData.actualDuration;
    }
    if (completionData.notes) {
      updateData.notes = completionData.notes;
    }
    if (completionData.technician) {
      updateData.technician = completionData.technician;
    }
    if (completionData.completedAtHours !== undefined) {
      updateData.completed_at_hours = completionData.completedAtHours;
    }
    if (completionData.completedAtKm !== undefined) {
      updateData.completed_at_km = completionData.completedAtKm;
    }

    const { error } = await supabase
      .from('maintenance_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      console.error('Error completing task:', error);
      throw new Error('Failed to complete maintenance task');
    }

    // If the task is recurrent, automatically create the next one
    if (taskData && taskData.is_recurrent && taskData.recurrence_interval) {
      await this.createNextRecurringTask(taskData, completionData);
    }
  }

  private async createNextRecurringTask(completedTask: any, completionData: {
    completedAtHours?: number;
    completedAtKm?: number;
  }): Promise<void> {
    const interval = completedTask.recurrence_interval;
    const recurrenceUnit = completedTask.recurrence_unit || completedTask.trigger_unit;
    
    let newTriggerHours = completedTask.trigger_hours;
    let newTriggerKm = completedTask.trigger_kilometers;
    let newDueDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10);

    if (recurrenceUnit === 'hours' || completedTask.trigger_unit === 'hours') {
      const baseHours = completionData.completedAtHours ?? completedTask.trigger_hours ?? 0;
      newTriggerHours = baseHours + interval;
    } else if (recurrenceUnit === 'kilometers' || completedTask.trigger_unit === 'kilometers') {
      const baseKm = completionData.completedAtKm ?? completedTask.trigger_kilometers ?? 0;
      newTriggerKm = baseKm + interval;
    } else {
      const baseDate = new Date();
      baseDate.setDate(baseDate.getDate() + interval);
      newDueDate = baseDate;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    if (!currentUserId) return;

    const newTask = {
      title: completedTask.title,
      equipment: completedTask.equipment,
      equipment_id: completedTask.equipment_id,
      type: completedTask.type,
      status: 'scheduled',
      priority: completedTask.priority,
      due_date: newDueDate.toISOString(),
      estimated_duration: completedTask.estimated_duration,
      assigned_to: completedTask.assigned_to,
      notes: 'Tâche récurrente générée automatiquement',
      trigger_unit: completedTask.trigger_unit,
      trigger_hours: newTriggerHours,
      trigger_kilometers: newTriggerKm,
      owner_id: currentUserId,
      is_recurrent: true,
      recurrence_interval: interval,
      recurrence_unit: recurrenceUnit,
    };

    console.log('Creating next recurring maintenance task:', newTask);

    const { error } = await supabase
      .from('maintenance_tasks')
      .insert(newTask);

    if (error) {
      console.error('Error creating next recurring task:', error);
    }
  }

  async bulkCreateMaintenance(tasks: Omit<MaintenanceTask, 'id'>[]): Promise<MaintenanceTask[]> {
    if (tasks.length === 0) return [];
    
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    
    if (!currentUserId) {
      throw new Error('You must be logged in to add maintenance tasks');
    }
    
    const insertData = tasks.map(task => ({
      title: task.title,
      equipment: task.equipment,
      equipment_id: task.equipmentId,
      type: task.type,
      status: task.status || 'scheduled',
      priority: task.priority,
      due_date: task.dueDate.toISOString(),
      estimated_duration: task.engineHours,
      assigned_to: task.assignedTo,
      notes: task.notes,
      trigger_unit: task.trigger_unit,
      trigger_hours: task.trigger_hours,
      trigger_kilometers: task.trigger_kilometers,
      owner_id: currentUserId
    }));

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert(insertData)
      .select();

    if (error) {
      throw new Error('Failed to add maintenance tasks: ' + error.message);
    }

    return data.map(task => this.mapTaskFromDb(task));
  }
}

export const maintenanceTasksService = new MaintenanceTasksService();
