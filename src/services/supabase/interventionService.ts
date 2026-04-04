
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

function mapDbToIntervention(data: any): Intervention {
  return {
    ...data,
    coordinates: data.coordinates as { lat: number; lng: number } | undefined,
  } as Intervention;
}

export const interventionService = {
  async getInterventions(): Promise<Intervention[]> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching interventions:', error);
        toast.error('Erreur lors du chargement des interventions');
        throw error;
      }

      return (data || []).map(mapDbToIntervention);
    } catch (err) {
      console.error('Exception lors du chargement des interventions:', err);
      throw err;
    }
  },

  async getInterventionById(id: number): Promise<Intervention | null> {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching intervention by id:', error);
        toast.error("Erreur lors du chargement de l'intervention");
        throw error;
      }

      return mapDbToIntervention(data);
    } catch (err) {
      console.error("Exception lors du chargement de l'intervention:", err);
      throw err;
    }
  },

  async addIntervention(intervention: InterventionFormValues): Promise<Intervention> {
    try {
      const insertData: any = {
        title: intervention.title,
        description: intervention.description,
        equipment: intervention.equipment,
        location: intervention.location || "",
        status: intervention.status || "scheduled",
        priority: intervention.priority,
        technician: intervention.technician || "",
        date: intervention.date instanceof Date ? intervention.date.toISOString() : intervention.date,
        "scheduledDuration": intervention.scheduledDuration || 1,
        equipment_id: intervention.equipmentId,
      };

      const { data, error } = await supabase
        .from('interventions')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error adding intervention:', error);
        toast.error("Erreur lors de l'ajout de l'intervention");
        throw error;
      }

      return mapDbToIntervention(data);
    } catch (err) {
      console.error("Exception lors de l'ajout de l'intervention:", err);
      throw err;
    }
  },

  async updateIntervention(id: number, updates: Partial<Intervention>): Promise<Intervention> {
    try {
      // Convert Date fields to strings for DB
      const dbUpdates: any = { ...updates };
      if (dbUpdates.date instanceof Date) {
        dbUpdates.date = dbUpdates.date.toISOString();
      }

      const { data, error } = await supabase
        .from('interventions')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating intervention:', error);
        toast.error("Erreur lors de la mise à jour de l'intervention");
        throw error;
      }

      return mapDbToIntervention(data);
    } catch (err) {
      console.error("Exception lors de la mise à jour de l'intervention:", err);
      throw err;
    }
  },

  async updateInterventionStatus(id: number, status: 'scheduled' | 'in-progress' | 'completed' | 'canceled'): Promise<Intervention> {
    return this.updateIntervention(id, { status });
  },

  async deleteIntervention(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('interventions')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting intervention:', error);
        toast.error("Erreur lors de la suppression de l'intervention");
        throw error;
      }
    } catch (err) {
      console.error("Exception lors de la suppression de l'intervention:", err);
      throw err;
    }
  }
};
