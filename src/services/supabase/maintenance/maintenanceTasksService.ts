import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';

export class MaintenanceTasksService {
  async getTasks(): Promise<MaintenanceTask[]> {
    console.log('Fetching all maintenance tasks from Supabase');
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
    console.log('Adding maintenance task to Supabase:', task);
    
    // Récupérer l'utilisateur connecté
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    
    if (!currentUserId) {
      console.error('No authenticated user found when adding task');
      throw new Error('You must be logged in to add maintenance tasks');
    }
    
    // Prepare the data for insertion into Supabase
    const insertData = {
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
      owner_id: currentUserId // Assurer que l'owner_id est défini
    };
    
    console.log('Prepared data for insertion with owner_id:', insertData);

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

    console.log('Task added successfully, returned data:', data);

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
      engineHours: data.estimated_duration || 0,
      actualDuration: data.actual_duration,
      assignedTo: data.assigned_to || '',
      notes: data.notes || '',
      trigger_unit: data.trigger_unit,
      trigger_hours: data.trigger_hours,
      trigger_kilometers: data.trigger_kilometers,
    };
  }

  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
    console.log(`Updating task ${taskId} status to ${status}`);
    
    // Préparer les données à mettre à jour
    const updateData: any = { status };
    
    // Si le statut est "completed", ajouter automatiquement la date de complétion
    if (status === 'completed') {
      updateData.completed_date = new Date().toISOString();
      console.log('Adding completion date for completed task:', updateData.completed_date);
    }
    
    const { error } = await supabase
      .from('maintenance_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      throw new Error('Failed to update task status');
    }
    
    console.log('Task status updated successfully with completion date if applicable');
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
      engineHours: data.estimated_duration || 0,
      actualDuration: task.actual_duration,
      assignedTo: task.assigned_to || '',
      notes: task.notes || '',
      trigger_unit: task.trigger_unit,
      trigger_hours: task.trigger_hours,
      trigger_kilometers: task.trigger_kilometers,
    }));
  }

  async completeTask(taskId: number, completionData: {
    completedDate?: Date;
    actualDuration?: number;
    notes?: string;
    technician?: string;
  }): Promise<void> {
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

    const { error } = await supabase
      .from('maintenance_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      console.error('Error completing task:', error);
      throw new Error('Failed to complete maintenance task');
    }
  }

  async bulkCreateMaintenance(tasks: Omit<MaintenanceTask, 'id'>[]): Promise<MaintenanceTask[]> {
    console.log('Bulk creating maintenance tasks:', tasks);
    
    if (tasks.length === 0) {
      return [];
    }
    
    // Récupérer l'utilisateur connecté
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData.session?.user?.id;
    
    if (!currentUserId) {
      console.error('No authenticated user found when adding task');
      throw new Error('You must be logged in to add maintenance tasks');
    }
    
    // Préparer les données pour l'insertion en masse
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
    
    console.log('Prepared data for bulk insertion:', insertData);

    const { data, error } = await supabase
      .from('maintenance_tasks')
      .insert(insertData)
      .select();

    if (error) {
      console.error('Error bulk adding tasks:', error);
      throw new Error('Failed to add maintenance tasks: ' + error.message);
    }

    console.log('Tasks added successfully, returned data:', data);

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

export const maintenanceTasksService = new MaintenanceTasksService();
