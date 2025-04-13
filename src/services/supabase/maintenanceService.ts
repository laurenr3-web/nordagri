import { supabase } from '@/integrations/supabase/client';
import { MaintenanceTask, MaintenanceFormValues, MaintenanceStatus, MaintenanceType, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { 
  MaintenancePlan, 
  MaintenanceFrequency, 
  MaintenanceUnit 
} from '@/hooks/maintenance/types/maintenancePlanTypes';

export const maintenanceService = {
  /**
   * Récupérer toutes les tâches de maintenance
   */
  async getTasks(): Promise<MaintenanceTask[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty tasks array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', userId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Convertir les données de la base en objets MaintenanceTask
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        equipment: task.equipment,
        equipmentId: task.equipment_id,
        type: task.type as MaintenanceType,
        status: task.status as MaintenanceStatus,
        priority: task.priority as MaintenancePriority,
        dueDate: new Date(task.due_date),
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        engineHours: task.estimated_duration || 0, // Using estimated_duration as engineHours
        actualDuration: task.actual_duration,
        assignedTo: task.assigned_to || '',
        notes: task.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les tâches de maintenance pour un équipement spécifique
   */
  async getTasksForEquipment(equipmentId: number): Promise<MaintenanceTask[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty tasks array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', userId)
        .eq('equipment_id', equipmentId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Convertir les données de la base en objets MaintenanceTask
      return data.map((task: any) => ({
        id: task.id,
        title: task.title,
        equipment: task.equipment,
        equipmentId: task.equipment_id,
        type: task.type as MaintenanceType,
        status: task.status as MaintenanceStatus,
        priority: task.priority as MaintenancePriority,
        dueDate: new Date(task.due_date),
        completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
        engineHours: task.estimated_duration || 0, // Using estimated_duration as engineHours
        actualDuration: task.actual_duration,
        assignedTo: task.assigned_to || '',
        notes: task.notes || ''
      }));
    } catch (error) {
      console.error('Error fetching maintenance tasks for equipment:', error);
      throw error;
    }
  },
  
  /**
   * Ajouter une nouvelle tâche
   */
  async addTask(task: MaintenanceFormValues): Promise<MaintenanceTask> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Préparer les données pour la base
      const taskData = {
        title: task.title,
        equipment: task.equipment,
        equipment_id: task.equipmentId,
        type: task.type,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate.toISOString(),
        engine_hours: task.engineHours,
        assigned_to: task.assignedTo || null,
        notes: task.notes,
        owner_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .insert(taskData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Retourner la tâche avec son ID généré
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
        engineHours: data.engine_hours || 0,
        assignedTo: data.assigned_to || '',
        notes: data.notes || ''
      };
    } catch (error) {
      console.error('Error adding maintenance task:', error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour le statut d'une tâche
   */
  async updateTaskStatus(taskId: number, status: MaintenanceStatus): Promise<void> {
    try {
      const updates = {
        status,
        updated_at: new Date().toISOString(),
        // Si le statut est "completed", ajouter la date de complétion
        ...(status === 'completed' ? { completed_date: new Date().toISOString() } : {})
      };
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  },

  /**
   * Marquer une tâche comme complétée
   */
  async completeTask(taskId: number, completionData: {
    completedDate: Date;
    actualDuration: number;
    notes: string;
    technician: string;
  }): Promise<void> {
    try {
      const updates = {
        status: 'completed' as MaintenanceStatus,
        completed_date: completionData.completedDate.toISOString(),
        actual_duration: completionData.actualDuration,
        notes: completionData.notes,
        assigned_to: completionData.technician,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('maintenance_tasks')
        .update(updates)
        .eq('id', taskId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error completing task:', error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour la priorité d'une tâche
   */
  async updateTaskPriority(taskId: number, priority: MaintenancePriority): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .update({
          priority,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating task priority:', error);
      throw error;
    }
  },
  
  /**
   * Supprimer une tâche
   */
  async deleteTask(taskId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  },
  
  /**
   * Récupérer les plans de maintenance
   */
  async getMaintenancePlans(): Promise<MaintenancePlan[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty plans array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .eq('created_by', userId)
        .eq('active', true)
        .order('next_due_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map((plan: any) => ({
        id: plan.id,
        title: plan.title,
        description: plan.description || '',
        equipmentId: plan.equipment_id,
        equipmentName: plan.equipment_name,
        frequency: plan.frequency as MaintenanceFrequency,
        interval: plan.interval,
        unit: plan.unit as MaintenanceUnit,
        nextDueDate: new Date(plan.next_due_date),
        lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : null,
        type: plan.type as MaintenanceType,
        engineHours: plan.engine_hours || 0,
        active: plan.active,
        priority: plan.priority as MaintenancePriority,
        assignedTo: plan.assigned_to
      }));
    } catch (error) {
      console.error('Error fetching maintenance plans:', error);
      throw error;
    }
  },

  /**
   * Récupérer les plans de maintenance pour un équipement spécifique
   */
  async getMaintenancePlansForEquipment(equipmentId: number): Promise<MaintenancePlan[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        console.warn('User not authenticated, returning empty plans array');
        return [];
      }
      
      const { data, error } = await supabase
        .from('maintenance_plans')
        .select('*')
        .eq('created_by', userId)
        .eq('equipment_id', equipmentId)
        .eq('active', true)
        .order('next_due_date', { ascending: true });
      
      if (error) throw error;
      
      return data.map((plan: any) => ({
        id: plan.id,
        title: plan.title,
        description: plan.description || '',
        equipmentId: plan.equipment_id,
        equipmentName: plan.equipment_name,
        frequency: plan.frequency as MaintenanceFrequency,
        interval: plan.interval,
        unit: plan.unit as MaintenanceUnit,
        nextDueDate: new Date(plan.next_due_date),
        lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : null,
        type: plan.type as MaintenanceType,
        engineHours: plan.engine_hours || 0,
        active: plan.active,
        priority: plan.priority as MaintenancePriority,
        assignedTo: plan.assigned_to
      }));
    } catch (error) {
      console.error('Error fetching maintenance plans for equipment:', error);
      throw error;
    }
  },
  
  /**
   * Ajouter un plan de maintenance
   */
  async addMaintenancePlan(plan: Omit<MaintenancePlan, 'id'>): Promise<MaintenancePlan> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      // Préparer les données pour la base
      const planData = {
        title: plan.title,
        description: plan.description,
        equipment_id: plan.equipmentId,
        equipment_name: plan.equipmentName,
        frequency: plan.frequency,
        interval: plan.interval,
        unit: plan.unit,
        next_due_date: plan.nextDueDate.toISOString(),
        last_performed_date: plan.lastPerformedDate ? plan.lastPerformedDate.toISOString() : null,
        type: plan.type,
        engine_hours: plan.engineHours,
        active: plan.active,
        priority: plan.priority,
        assigned_to: plan.assignedTo,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance_plans')
        .insert(planData)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        equipmentId: data.equipment_id,
        equipmentName: data.equipment_name,
        frequency: data.frequency,
        interval: data.interval,
        unit: data.unit,
        nextDueDate: new Date(data.next_due_date),
        lastPerformedDate: data.last_performed_date ? new Date(data.last_performed_date) : null,
        type: data.type,
        engineHours: data.engine_hours || 0,
        active: data.active,
        priority: data.priority,
        assignedTo: data.assigned_to
      };
    } catch (error) {
      console.error('Error adding maintenance plan:', error);
      throw error;
    }
  },
  
  /**
   * Mettre à jour un plan de maintenance
   */
  async updateMaintenancePlan(planId: number, updates: Partial<MaintenancePlan>): Promise<MaintenancePlan | null> {
    try {
      // Convertir les dates en chaînes ISO pour Supabase
      const planUpdates = {
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.equipmentId !== undefined && { equipment_id: updates.equipmentId }),
        ...(updates.equipmentName !== undefined && { equipment_name: updates.equipmentName }),
        ...(updates.frequency !== undefined && { frequency: updates.frequency }),
        ...(updates.interval !== undefined && { interval: updates.interval }),
        ...(updates.unit !== undefined && { unit: updates.unit }),
        ...(updates.nextDueDate !== undefined && { next_due_date: updates.nextDueDate.toISOString() }),
        ...(updates.lastPerformedDate !== undefined && { 
          last_performed_date: updates.lastPerformedDate ? updates.lastPerformedDate.toISOString() : null 
        }),
        ...(updates.type !== undefined && { type: updates.type }),
        ...(updates.engineHours !== undefined && { engine_hours: updates.engineHours }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.assignedTo !== undefined && { assigned_to: updates.assignedTo }),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('maintenance_plans')
        .update(planUpdates)
        .eq('id', planId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description || '',
        equipmentId: data.equipment_id,
        equipmentName: data.equipment_name,
        frequency: data.frequency,
        interval: data.interval,
        unit: data.unit,
        nextDueDate: new Date(data.next_due_date),
        lastPerformedDate: data.last_performed_date ? new Date(data.last_performed_date) : null,
        type: data.type,
        engineHours: data.engine_hours || 0,
        active: data.active,
        priority: data.priority,
        assignedTo: data.assigned_to
      };
    } catch (error) {
      console.error('Error updating maintenance plan:', error);
      throw error;
    }
  }
};
