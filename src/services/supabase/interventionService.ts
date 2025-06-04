
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Service for managing interventions through Supabase
 */
export const interventionService = {
  /**
   * Get all interventions
   */
  async getInterventions(): Promise<Intervention[]> {
    try {
      console.log('Fetching real interventions from Supabase');
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching interventions:', error);
        toast.error('Erreur lors du chargement des interventions');
        throw error;
      }
      
      // Convert the data to match our Intervention interface
      return (data || []).map(item => ({
        ...item,
        coordinates: item.coordinates as { lat: number; lng: number } | undefined,
        date: item.date
      })) as Intervention[];
    } catch (err) {
      console.error('Exception lors du chargement des interventions:', err);
      throw err;
    }
  },
  
  /**
   * Get intervention by ID
   */
  async getInterventionById(id: number): Promise<Intervention | null> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching intervention by id:', error);
        toast.error('Erreur lors du chargement de l\'intervention');
        throw error;
      }
      
      return {
        ...data,
        coordinates: data.coordinates as { lat: number; lng: number } | undefined,
        date: data.date
      } as Intervention;
    } catch (err) {
      console.error('Exception lors du chargement de l\'intervention:', err);
      throw err;
    }
  },
  
  /**
   * Add a new intervention
   */
  async addIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .insert({
          description: intervention.description,
          equipment: intervention.equipment,
          location: intervention.location || "",
          status: intervention.status || "scheduled",
          priority: intervention.priority,
          technician: intervention.technician || "",
          date: intervention.date.toISOString(),
          scheduled_duration: intervention.scheduledDuration || 1,
          equipment_id: intervention.equipmentId
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding intervention:', error);
        toast.error('Erreur lors de l\'ajout de l\'intervention');
        throw error;
      }
      
      return {
        ...data,
        coordinates: data.coordinates as { lat: number; lng: number } | undefined,
        date: data.date
      } as Intervention;
    } catch (err) {
      console.error('Exception lors de l\'ajout de l\'intervention:', err);
      throw err;
    }
  },
  
  /**
   * Update intervention
   */
  async updateIntervention(id: number, updates: Partial<Intervention>): Promise<Intervention> {
    try {
      // Convert date to string if it's a Date object
      const processedUpdates = {
        ...updates,
        date: updates.date instanceof Date ? updates.date.toISOString() : updates.date
      };

      const { data, error } = await supabase
        .from('interventions')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating intervention:', error);
        toast.error('Erreur lors de la mise à jour de l\'intervention');
        throw error;
      }
      
      return {
        ...data,
        coordinates: data.coordinates as { lat: number; lng: number } | undefined,
        date: data.date
      } as Intervention;
    } catch (err) {
      console.error('Exception lors de la mise à jour de l\'intervention:', err);
      throw err;
    }
  },
  
  /**
   * Update intervention status
   */
  async updateInterventionStatus(id: number, status: 'scheduled' | 'in-progress' | 'completed' | 'canceled'): Promise<Intervention> {
    return this.updateIntervention(id, { status });
  },
  
  /**
   * Delete intervention
   */
  async deleteIntervention(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting intervention:', error);
        toast.error('Erreur lors de la suppression de l\'intervention');
        throw error;
      }
    } catch (err) {
      console.error('Exception lors de la suppression de l\'intervention:', err);
      throw err;
    }
  }
};
