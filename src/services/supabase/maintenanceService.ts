
import { supabase } from '@/integrations/supabase/client';
import { MaintenancePlan } from '@/hooks/maintenance/useMaintenancePlanner';

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
        frequency: plan.frequency || 'monthly',
        interval: plan.interval || 30,
        unit: plan.unit || 'days',
        nextDueDate: new Date(plan.next_due_date),
        lastPerformedDate: plan.last_performed_date ? new Date(plan.last_performed_date) : null,
        type: plan.type || 'preventive',
        engineHours: plan.engine_hours || 0,
        active: plan.active !== false,
        priority: plan.priority || 'medium',
        assignedTo: plan.assigned_to || null,
      }));
    } catch (error) {
      console.error('Error in getMaintenancePlansForEquipment:', error);
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
  }
};
