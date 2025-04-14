
import { supabase } from '@/integrations/supabase/client';
import { EquipmentData } from '@/hooks/dashboard/types/dashboardTypes';

/**
 * Service for dashboard data fetching
 */
export const dashboardService = {
  
  /**
   * Fetch equipment status data
   */
  async getEquipmentStatusData(): Promise<EquipmentData[]> {
    try {
      // Query equipment data from Supabase
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, type, status, image, model')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching equipment data:', error);
        return [];
      }

      // Transform and return the data
      return (data || []).map(item => ({
        id: item.id,
        name: item.name || 'Unnamed Equipment',
        type: item.type || 'Unknown Type',
        status: item.status || 'unknown',
        image: item.image || undefined,
        model: item.model || undefined,
        usage_hours: Math.floor(Math.random() * 1000), // Mock data
        usage_target: 1000 // Mock target
      }));
    } catch (error) {
      console.error('Unexpected error fetching equipment data:', error);
      return [];
    }
  },

  /**
   * Get stats data for dashboard
   */
  async getStats(userId: string): Promise<any[]> {
    return [
      { id: 1, title: "Équipements", value: "12", change: "+2", type: "positive" },
      { id: 2, title: "Interventions", value: "24", change: "-3", type: "negative" },
      { id: 3, title: "Maintenance", value: "92%", change: "+5%", type: "positive" }
    ];
  },

  /**
   * Get equipment data for dashboard
   */
  async getEquipment(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .limit(10);

      if (error) {
        console.error('Error fetching equipment:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching equipment:', error);
      return [];
    }
  },

  /**
   * Get maintenance events for dashboard
   */
  async getMaintenanceEvents(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) {
        console.error('Error fetching maintenance events:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching maintenance events:', error);
      return [];
    }
  },

  /**
   * Get alerts for dashboard
   */
  async getAlerts(userId: string): Promise<any[]> {
    return [
      { id: 1, title: "Niveau d'huile bas", type: "warning", equipment: "Tracteur John Deere", timestamp: new Date() },
      { id: 2, title: "Maintenance préventive requise", type: "info", equipment: "Moissonneuse XYZ", timestamp: new Date() }
    ];
  },

  /**
   * Get tasks for dashboard
   */
  async getTasks(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching tasks:', error);
      return [];
    }
  },

  /**
   * Get interventions data
   */
  async getInterventions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching interventions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching interventions:', error);
      return [];
    }
  },

  /**
   * Fetch intervention data for the dashboard
   */
  async getDashboardInterventions() {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching interventions:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching interventions:', error);
      return [];
    }
  },

  /**
   * Fetch maintenance tasks for the dashboard
   */
  async getDashboardMaintenanceTasks() {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) {
        console.error('Error fetching maintenance tasks:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching maintenance tasks:', error);
      return [];
    }
  }
};
