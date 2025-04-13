import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { InterventionDB, InterventionFormValues, InterventionStatus } from '@/types/models/intervention';
import { useQueryClient } from '@tanstack/react-query';

// Structure to show when an intervention is loading
export const loadingIntervention = {
  id: 0,
  title: 'Chargement...',
  equipment: '',
  status: 'scheduled' as InterventionStatus,
  date: new Date(),
  priority: 'medium',
  location: '',
  technician: '',
  equipmentId: 0
};

export const useInterventionsData = () => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const createIntervention = async (formData: InterventionFormValues & { equipment_id?: number }) => {
    setIsSubmitting(true);
    
    try {
      // Format the intervention for the database
      const interventionData: Partial<InterventionDB> = {
        title: formData.title,
        equipment: formData.equipment,
        equipment_id: formData.equipment_id || formData.equipmentId,
        status: formData.status || 'scheduled',
        priority: formData.priority || 'medium',
        date: formData.date instanceof Date ? formData.date.toISOString() : String(formData.date),
        location: formData.location,
        technician: formData.technician || '',
        description: formData.description,
        notes: formData.notes,
        scheduled_duration: formData.scheduledDuration
      };
      
      // Ensure date is not undefined for the database insertion
      if (!interventionData.date) {
        interventionData.date = new Date().toISOString();
      }
      
      // Insert the intervention into the database
      const { data, error } = await supabase
        .from('interventions')
        .insert(interventionData as any)
        .select('*')
        .single();
        
      if (error) {
        console.error('Error creating intervention:', error);
        throw new Error(`Failed to create intervention: ${error.message}`);
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      
      return data;
    } catch (error) {
      console.error('Error in createIntervention:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const updateInterventionStatus = async (interventionId: number, newStatus: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ status: newStatus })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    } catch (error) {
      console.error(`Error updating intervention ${interventionId} status:`, error);
      throw error;
    }
  };

  const assignTechnician = async (interventionId: number, technicianName: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ technician: technicianName })
        .eq('id', interventionId);

      if (error) throw error;
      
      // Refetch interventions to update UI
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    } catch (error) {
      console.error(`Error assigning technician to intervention ${interventionId}:`, error);
      throw error;
    }
  };

  const submitInterventionReport = async (intervention: Partial<any>): Promise<void> => {
    try {
      // Prepare the data for update, converting Date objects to ISO strings
      const updateData: any = {
        status: 'completed'
      };
      
      if (intervention.duration) updateData.duration = intervention.duration;
      if (intervention.notes) updateData.notes = intervention.notes;
      if (intervention.partsUsed) updateData.parts_used = intervention.partsUsed;
      if (intervention.completedDate) updateData.completed_date = intervention.completedDate instanceof Date ? 
        intervention.completedDate.toISOString() : intervention.completedDate;
      
      const { error } = await supabase
        .from('interventions')
        .update(updateData)
        .eq('id', intervention.id);

      if (error) throw error;
      
      // Refetch interventions to update UI
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    } catch (error) {
      console.error(`Error submitting report for intervention ${intervention.id}:`, error);
      throw error;
    }
  };

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*');
        
      if (error) throw error;
      setInterventions(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching interventions:', error);
      toast.error('Erreur lors du chargement des interventions');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSubmitting,
    createIntervention,
    updateInterventionStatus,
    assignTechnician,
    submitInterventionReport,
    interventions,
    isLoading,
    fetchInterventions
  };
};
