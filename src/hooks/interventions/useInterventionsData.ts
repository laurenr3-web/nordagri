
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { 
  Intervention, 
  InterventionDB, 
  InterventionFormValues as BaseInterventionFormValues 
} from '@/types/models/intervention';
import { convertFromApi, convertToApi, safeDate } from '@/utils/typeTransformers';

// Extending the form values for API compatibility
export interface InterventionFormValues extends BaseInterventionFormValues {
  equipment_id: number;
  technician: string;  // Required for API
}

export type { Intervention };  // Re-export for convenience

export const useInterventionsData = () => {
  // Use react-query to fetch interventions with caching and refetching
  const fetchInterventions = async () => {
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching interventions:', error);
      throw new Error('Failed to fetch interventions data');
    }
    
    // Map database response to our Intervention type with JSON parsing for parts_used
    return data.map((item: InterventionDB) => {
      // Basic property conversion
      const intervention = convertFromApi<Intervention>(item);
      
      // Special handling for dates and complex objects
      return {
        ...intervention,
        date: safeDate(item.date) || new Date(),
        partsUsed: Array.isArray(item.parts_used) ? item.parts_used : 
                  (typeof item.parts_used === 'string' ? 
                    JSON.parse(item.parts_used) : 
                    [])
      };
    });
  };

  const {
    data: interventions = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: fetchInterventions
  });

  // Function to create a new intervention
  const createIntervention = async (formData: InterventionFormValues): Promise<Intervention> => {
    try {
      // Convert form data to database format
      const interventionData = convertToApi<InterventionDB>({
        ...formData,
        date: formData.date instanceof Date ? formData.date.toISOString() : formData.date
      });

      const { data, error } = await supabase
        .from('interventions')
        .insert(interventionData)
        .select()
        .single();

      if (error) throw error;

      // Refetch the interventions list to update UI
      refetch();
      
      // Convert database response back to our Intervention type
      const newIntervention = convertFromApi<Intervention>(data);
      newIntervention.date = safeDate(data.date) || new Date();
      
      return newIntervention;
    } catch (error) {
      console.error('Error creating intervention:', error);
      throw error;
    }
  };

  // Function to update intervention status
  const updateInterventionStatus = async (interventionId: number, newStatus: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ status: newStatus })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      refetch();
    } catch (error) {
      console.error(`Error updating intervention ${interventionId} status:`, error);
      throw error;
    }
  };

  // Function to assign technician
  const assignTechnician = async (interventionId: number, technicianName: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ technician: technicianName })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      refetch();
    } catch (error) {
      console.error(`Error assigning technician to intervention ${interventionId}:`, error);
      throw error;
    }
  };

  // Function to submit intervention report
  const submitInterventionReport = async (intervention: Partial<Intervention>): Promise<void> => {
    try {
      // Prepare the data for update, converting Date objects to ISO strings
      const updateData: any = {
        ...convertToApi(intervention),
        status: 'completed'
      };
      
      // Remove the id from the update object - use it in the where clause instead
      const interventionId = updateData.id;
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;
      delete updateData.owner_id;
      
      const { error } = await supabase
        .from('interventions')
        .update(updateData)
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      refetch();
    } catch (error) {
      console.error(`Error submitting report for intervention ${intervention.id}:`, error);
      throw error;
    }
  };

  return {
    interventions,
    isLoading,
    error,
    refetch,
    createIntervention,
    updateInterventionStatus,
    assignTechnician,
    submitInterventionReport
  };
};
