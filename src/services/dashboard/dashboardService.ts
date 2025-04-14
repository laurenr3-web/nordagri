
import { supabase } from '@/integrations/supabase/client';
import { StatsData, EquipmentData, MaintenanceEvent, AlertItem, Task } from '@/hooks/dashboard/types/dashboardTypes';

/**
 * Service dédié à la récupération des données pour le tableau de bord
 */
export const dashboardService = {
  /**
   * Récupère les statistiques principales
   */
  async getStats(userId: string): Promise<StatsData[]> {
    try {
      // Simuler la récupération des statistiques
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('owner_id', userId);
      
      if (error) throw error;
      
      // Retourner les données ou un tableau vide
      return data || [];
    } catch (error) {
      console.error('Error fetching stats data:', error);
      // Retourner des données par défaut en cas d'erreur
      return [];
    }
  },

  /**
   * Récupère les données d'équipement
   */
  async getEquipment(userId: string): Promise<EquipmentData[]> {
    try {
      // Tentative de récupération depuis la table 'equipments' d'abord
      const { data: equipmentsData, error: equipmentsError } = await supabase
        .from('equipments')
        .select('id, name, type, status, image, usage_hours, usage_target, model')
        .eq('owner_id', userId)
        .limit(6);

      if (equipmentsError) {
        console.log("Error with 'equipments', trying 'equipment':", equipmentsError);
        
        // Si erreur, tenter la table 'equipment'
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name, type, status, image')
          .eq('owner_id', userId)
          .limit(6);

        if (equipmentError) {
          throw new Error("Unable to access equipments or equipment tables");
        }

        return equipmentData || [];
      }

      return equipmentsData || [];
    } catch (error) {
      console.error('Error fetching equipment data:', error);
      return [];
    }
  },

  /**
   * Récupère les événements de maintenance
   */
  async getMaintenanceEvents(userId: string): Promise<MaintenanceEvent[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', userId)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching maintenance data:', error);
      return [];
    }
  },

  /**
   * Récupère les alertes
   */
  async getAlerts(userId: string): Promise<AlertItem[]> {
    try {
      // Implémenter la récupération des alertes depuis Supabase
      // Pour l'instant, retournons un tableau vide
      return [];
    } catch (error) {
      console.error('Error fetching alerts data:', error);
      return [];
    }
  },

  /**
   * Récupère les tâches à venir
   */
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('status', 'scheduled')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching tasks data:', error);
      return [];
    }
  },
  
  /**
   * Récupère les interventions urgentes
   */
  async getInterventions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('priority', { ascending: false });
        
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching interventions:', error);
      return [];
    }
  }
};
