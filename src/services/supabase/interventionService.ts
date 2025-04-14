
import { supabase, withRetry } from '@/integrations/supabase/client';
import { InterventionFormValues } from '@/types/models/intervention';
import { toast } from 'sonner';

/**
 * Service for handling intervention operations
 */
export const interventionService = {
  /**
   * Get all interventions
   */
  getInterventions: async () => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data || [];
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
  getInterventionById: async (id: number | string) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
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
  createIntervention: async (values: InterventionFormValues) => {
    try {
      // Add validation for required fields
      if (!values.title) {
        throw new Error("Le titre est obligatoire");
      }
      
      if (!values.equipmentId) {
        throw new Error("L'équipement est obligatoire");
      }
      
      // Adding coordinates property for geolocation if provided
      const coordinates = values.location ? {
        latitude: values.location.latitude || null,
        longitude: values.location.longitude || null
      } : null;
      
      const { data, error } = await withRetry(async () => {
        const toastId = 'create-intervention';
        toast.loading('Création de l\'intervention...', { id: toastId });
        
        try {
          // Prepare the intervention data with optional coordinates
          const interventionData = {
            title: values.title,
            description: values.description || '',
            equipment_id: values.equipmentId,
            priority: values.priority || 'medium',
            status: values.status || 'scheduled',
            scheduled_date: values.scheduledDate,
            technician: values.technician || null,
            coordinates: coordinates,
            // Add other fields as needed
          };
          
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
      return data;
    } catch (error: any) {
      console.error('Error creating intervention:', error);
      throw error;
    }
  },
  
  /**
   * Update an intervention
   */
  updateIntervention: async (id: number, values: Partial<InterventionFormValues>) => {
    try {
      // Adding coordinates property for geolocation if provided
      const coordinates = values.location ? {
        latitude: values.location.latitude || null,
        longitude: values.location.longitude || null
      } : undefined;
      
      const { data, error } = await withRetry(async () => {
        const toastId = 'update-intervention';
        toast.loading('Mise à jour de l\'intervention...', { id: toastId });
        
        try {
          // Prepare the update data with optional coordinates
          const updateData: any = {
            ...values,
            coordinates: coordinates,
            // Map any fields that need renaming
            equipment_id: values.equipmentId,
          };
          
          // Remove specific fields that shouldn't be sent directly
          delete updateData.equipmentId;
          delete updateData.location;
          
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
      return data;
    } catch (error: any) {
      console.error(`Error updating intervention with ID ${id}:`, error);
      throw error;
    }
  }
};

export default interventionService;
