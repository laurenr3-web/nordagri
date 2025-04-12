
import { supabase } from '@/integrations/supabase/client';
import { MaintenancePlan, MaintenanceFrequency, MaintenanceUnit, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/useMaintenancePlanner';
import { MaintenanceStatus } from '@/hooks/maintenance/maintenanceSlice';

export const maintenanceService = {
  /**
   * Récupère les plans de maintenance pour un équipement spécifique
   */
  async getMaintenancePlansForEquipment(equipmentId: number): Promise<MaintenancePlan[]> {
    try {
      console.log(`Fetching maintenance plans for equipment ID ${equipmentId}`);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty maintenance plans');
        return [];
      }
      
      // Récupérer les plans de maintenance pour cet équipement
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('next_due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching maintenance plans:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} maintenance plans for equipment ${equipmentId}`);
      
      // Transformer les données en objets MaintenancePlan
      return (data || []).map(plan => ({
        id: plan.id,
        title: plan.title,
        description: plan.description || '',
        equipmentId: plan.equipment_id,
        equipmentName: plan.equipment_name || '',
        frequency: plan.frequency as MaintenanceFrequency,
        interval: plan.interval || 30,
        unit: plan.unit as MaintenanceUnit,
        nextDueDate: new Date(plan.next_due_date),
        lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : null,
        type: plan.type as MaintenanceType,
        engineHours: plan.engine_hours || 0,
        active: plan.active !== false,
        priority: plan.priority as MaintenancePriority,
        assignedTo: plan.assigned_to || null,
      }));
    } catch (error) {
      console.error('Error in getMaintenancePlansForEquipment:', error);
      throw error;
    }
  },

  /**
   * Récupère tous les plans de maintenance
   */
  async getMaintenancePlans(): Promise<MaintenancePlan[]> {
    try {
      console.log('Fetching all maintenance plans');
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty maintenance plans');
        return [];
      }
      
      // Récupérer tous les plans de maintenance
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .order('next_due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching maintenance plans:', error);
        throw error;
      }
      
      // Transformer les données en objets MaintenancePlan
      return (data || []).map(plan => ({
        id: plan.id,
        title: plan.title,
        description: plan.description || '',
        equipmentId: plan.equipment_id,
        equipmentName: plan.equipment_name || '',
        frequency: plan.frequency as MaintenanceFrequency,
        interval: plan.interval || 30,
        unit: plan.unit as MaintenanceUnit,
        nextDueDate: new Date(plan.next_due_date),
        lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : null,
        type: plan.type as MaintenanceType,
        engineHours: plan.engine_hours || 0,
        active: plan.active !== false,
        priority: plan.priority as MaintenancePriority,
        assignedTo: plan.assigned_to || null,
      }));
    } catch (error) {
      console.error('Error in getMaintenancePlans:', error);
      throw error;
    }
  },

  /**
   * Récupère toutes les tâches de maintenance
   */
  async getTasks(): Promise<any[]> {
    try {
      console.log('Fetching all maintenance tasks');
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty maintenance tasks');
        return [];
      }
      
      // Récupérer les tâches de maintenance
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', userId)
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching maintenance tasks:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Error in getTasks:', error);
      throw error;
    }
  },

  /**
   * Récupère les tâches de maintenance pour un équipement spécifique
   */
  async getTasksForEquipment(equipmentId: number): Promise<any[]> {
    try {
      console.log(`Fetching maintenance tasks for equipment ID ${equipmentId}`);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty maintenance tasks');
        return [];
      }
      
      // Récupérer les tâches de maintenance pour cet équipement
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('equipment_id', equipmentId)
        .eq('owner_id', userId)
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching maintenance tasks for equipment:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} maintenance tasks for equipment ${equipmentId}`);
      
      return data || [];
    } catch (error) {
      console.error(`Error in getTasksForEquipment (${equipmentId}):`, error);
      throw error;
    }
  },

  /**
   * Ajoute une nouvelle tâche de maintenance
   */
  async addTask(taskData: any): Promise<any> {
    try {
      console.log('Adding maintenance task:', taskData);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Transformer les données pour la base de données
      const dbTask = {
        title: taskData.title,
        equipment: taskData.equipment,
        equipment_id: taskData.equipmentId,
        type: taskData.type,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate instanceof Date ? taskData.dueDate.toISOString() : taskData.dueDate,
        engine_hours: taskData.engineHours || 0,
        notes: taskData.notes || '',
        assigned_to: taskData.assignedTo || '',
        owner_id: userId,
        part_id: taskData.partId || null
      };
      
      // Ajouter la tâche à la base de données
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert([dbTask])
        .select();
      
      if (error) {
        console.error('Error adding task:', error);
        throw error;
      }
      
      return data && data[0] ? data[0] : null;
    } catch (error) {
      console.error('Error in addTask:', error);
      throw error;
    }
  },

  /**
   * Met à jour le statut d'une tâche de maintenance
   */
  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<any> {
    try {
      console.log(`Updating task ${taskId} status to ${status}`);
      
      // Mettre à jour le statut dans la base de données
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update({ 
          status, 
          updated_at: new Date().toISOString(),
          completed_date: status === 'completed' ? new Date().toISOString() : null 
        })
        .eq('id', taskId)
        .select();
      
      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }
      
      return data && data[0] ? data[0] : null;
    } catch (error) {
      console.error('Error in updateTaskStatus:', error);
      throw error;
    }
  },

  /**
   * Supprime une tâche de maintenance
   */
  async deleteTask(taskId: number): Promise<void> {
    try {
      console.log(`Deleting task ${taskId}`);
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteTask:', error);
      throw error;
    }
  },

  /**
   * Ajoute un nouveau plan de maintenance
   */
  async addMaintenancePlan(plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan> {
    try {
      console.log('Adding maintenance plan:', plan);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Transformer les données pour la base de données
      const dbPlan = {
        title: plan.title,
        description: plan.description || '',
        equipment_id: plan.equipmentId,
        equipment_name: plan.equipmentName,
        frequency: plan.frequency,
        interval: plan.interval,
        unit: plan.unit,
        next_due_date: plan.nextDueDate instanceof Date ? plan.nextDueDate.toISOString() : plan.nextDueDate,
        last_performed_date: plan.lastPerformedDate instanceof Date ? plan.lastPerformedDate.toISOString() : null,
        type: plan.type,
        engine_hours: plan.engineHours || 0,
        active: plan.active,
        priority: plan.priority,
        assigned_to: plan.assignedTo || null,
        created_by: userId
      };
      
      // Ajouter le plan à la base de données
      const { data, error } = await supabase
        .from('maintenance_plans')
        .insert([dbPlan])
        .select();
      
      if (error) {
        console.error('Error adding maintenance plan:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to create maintenance plan');
      }
      
      // Transformer la réponse en objet MaintenancePlan
      return {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description || '',
        equipmentId: data[0].equipment_id,
        equipmentName: data[0].equipment_name,
        frequency: data[0].frequency as MaintenanceFrequency,
        interval: data[0].interval,
        unit: data[0].unit as MaintenanceUnit,
        nextDueDate: new Date(data[0].next_due_date),
        lastPerformedDate: data[0].last_performed_date ? new Date(data[0].last_performed_date) : null,
        type: data[0].type as MaintenanceType,
        engineHours: data[0].engine_hours || 0,
        active: data[0].active,
        priority: data[0].priority as MaintenancePriority,
        assignedTo: data[0].assigned_to || null
      };
    } catch (error) {
      console.error('Error in addMaintenancePlan:', error);
      throw error;
    }
  },

  /**
   * Met à jour un plan de maintenance
   */
  async updateMaintenancePlan(planId: number, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    try {
      console.log(`Updating maintenance plan ${planId}:`, updates);
      
      // Transformer les données pour la base de données
      const dbUpdates: Record<string, any> = {};
      
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.frequency) dbUpdates.frequency = updates.frequency;
      if (updates.interval) dbUpdates.interval = updates.interval;
      if (updates.unit) dbUpdates.unit = updates.unit;
      if (updates.nextDueDate) dbUpdates.next_due_date = updates.nextDueDate instanceof Date ? updates.nextDueDate.toISOString() : updates.nextDueDate;
      if (updates.lastPerformedDate) dbUpdates.last_performed_date = updates.lastPerformedDate instanceof Date ? updates.lastPerformedDate.toISOString() : updates.lastPerformedDate;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.engineHours !== undefined) dbUpdates.engine_hours = updates.engineHours;
      if (updates.active !== undefined) dbUpdates.active = updates.active;
      if (updates.priority) dbUpdates.priority = updates.priority;
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo;
      
      dbUpdates.updated_at = new Date().toISOString();
      
      // Mettre à jour le plan dans la base de données
      const { data, error } = await supabase
        .from('maintenance_plans')
        .update(dbUpdates)
        .eq('id', planId)
        .select();
      
      if (error) {
        console.error('Error updating maintenance plan:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        throw new Error('Failed to update maintenance plan');
      }
      
      // Transformer la réponse en objet MaintenancePlan
      return {
        id: data[0].id,
        title: data[0].title,
        description: data[0].description || '',
        equipmentId: data[0].equipment_id,
        equipmentName: data[0].equipment_name,
        frequency: data[0].frequency as MaintenanceFrequency,
        interval: data[0].interval,
        unit: data[0].unit as MaintenanceUnit,
        nextDueDate: new Date(data[0].next_due_date),
        lastPerformedDate: data[0].last_performed_date ? new Date(data[0].last_performed_date) : null,
        type: data[0].type as MaintenanceType,
        engineHours: data[0].engine_hours || 0,
        active: data[0].active,
        priority: data[0].priority as MaintenancePriority,
        assignedTo: data[0].assigned_to || null
      };
    } catch (error) {
      console.error('Error in updateMaintenancePlan:', error);
      throw error;
    }
  },

  /**
   * Complète une tâche de maintenance
   */
  async completeTask(taskId: number, completionData: any): Promise<any> {
    try {
      console.log(`Completing task ${taskId}:`, completionData);
      
      // Préparer les données de mise à jour
      const updateData = {
        status: 'completed' as MaintenanceStatus,
        completed_date: completionData.completedDate instanceof Date ? completionData.completedDate.toISOString() : completionData.completedDate || new Date().toISOString(),
        actual_duration: completionData.actualDuration,
        notes: completionData.notes ? `${completionData.notes}\n\nCompleted by: ${completionData.technician || 'Unknown'}` : `Completed by: ${completionData.technician || 'Unknown'}`,
        updated_at: new Date().toISOString()
      };
      
      // Mettre à jour la tâche dans la base de données
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .update(updateData)
        .eq('id', taskId)
        .select();
      
      if (error) {
        console.error('Error completing task:', error);
        throw error;
      }
      
      return data && data[0] ? data[0] : null;
    } catch (error) {
      console.error('Error in completeTask:', error);
      throw error;
    }
  }
};
