
import { supabase, withRetry } from '@/integrations/supabase/client';
import { InterventionDB, InterventionFormValues, Intervention } from '@/types/models/intervention';
import { toast } from 'sonner';
import { dbToClientIntervention, clientFormToDbIntervention, clientToDbIntervention } from './interventionAdapter';

/**
 * Service for handling intervention operations
 */
export const interventionService = {
  /**
   * Get all interventions
   */
  getInterventions: async (): Promise<Intervention[]> => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Convert database results to client model
      return data ? data.map(item => dbToClientIntervention(item as InterventionDB)) : [];
    } catch (error: any) {
      console.error('Error fetching interventions:', error);
      toast.error('Erreur lors du chargement des interventions', {
        description: error.message
      });
      return [];
    }
  },
  
  /**
   * Get intervention by ID
   */
  getInterventionById: async (id: number | string): Promise<Intervention | null> => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data ? dbToClientIntervention(data as InterventionDB) : null;
    } catch (error: any) {
      console.error(`Error fetching intervention with ID ${id}:`, error);
      toast.error('Erreur lors du chargement de l\'intervention', {
        description: error.message
      });
      return null;
    }
  },
  
  /**
   * Create a new intervention
   */
  createIntervention: async (values: InterventionFormValues): Promise<Intervention | null> => {
    try {
      // Add validation for required fields
      if (!values.title) {
        throw new Error("Le titre est obligatoire");
      }
      
      if (!values.equipmentId) {
        throw new Error("L'équipement est obligatoire");
      }
      
      const { data, error } = await withRetry(async () => {
        const toastId = 'create-intervention';
        toast.loading('Création de l\'intervention...', { id: toastId });
        
        try {
          // Convert form values to database format
          const interventionData = clientFormToDbIntervention(values);
          
          const { data, error } = await supabase
            .from('interventions')
            .insert(interventionData)
            .select()
            .single();
            
          if (error) throw error;
          
          toast.success('Intervention créée avec succès', { id: toastId });
          return { data, error: null };
        } catch (error: any) {
          toast.error('Erreur lors de la création', {
            id: toastId,
            description: error.message
          });
          throw error;
        }
      });
      
      if (error) throw error;
      return data ? dbToClientIntervention(data as InterventionDB) : null;
    } catch (error: any) {
      console.error('Error creating intervention:', error);
      throw error;
    }
  },
  
  /**
   * Update an intervention
   */
  updateIntervention: async (id: number, intervention: Partial<Intervention>): Promise<Intervention | null> => {
    try {
      const { data, error } = await withRetry(async () => {
        const toastId = 'update-intervention';
        toast.loading('Mise à jour de l\'intervention...', { id: toastId });
        
        try {
          // Convert client data to database format
          const updateData = clientToDbIntervention(intervention as Intervention);
          
          const { data, error } = await supabase
            .from('interventions')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();
            
          if (error) throw error;
          
          toast.success('Intervention mise à jour avec succès', { id: toastId });
          return { data, error: null };
        } catch (error: any) {
          toast.error('Erreur lors de la mise à jour', {
            id: toastId,
            description: error.message
          });
          throw error;
        }
      });
      
      if (error) throw error;
      return data ? dbToClientIntervention(data as InterventionDB) : null;
    } catch (error: any) {
      console.error(`Error updating intervention with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Update intervention status
   */
  updateInterventionStatus: async (id: number, status: string): Promise<Intervention | null> => {
    return interventionService.updateIntervention(id, { status: status as any });
  }
};

export default interventionService;
