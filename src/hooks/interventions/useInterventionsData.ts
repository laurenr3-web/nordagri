
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Intervention, InterventionFormValues, InterventionStatus } from '@/types/Intervention';

export const useInterventionsData = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all interventions
  const fetchInterventions = useCallback(async (): Promise<Intervention[]> => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching interventions:', error);
      throw error;
    }
  }, []);

  // Use React Query to manage interventions data
  const { data: interventions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: fetchInterventions,
  });

  // Create a new intervention
  const createIntervention = async (intervention: InterventionFormValues): Promise<Intervention> => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('interventions')
        .insert([intervention])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Intervention créée avec succès");
      refetch();
      return data;
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast.error("Erreur lors de la création de l'intervention");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update intervention status
  const updateInterventionStatus = async (id: number, status: InterventionStatus): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Statut de l'intervention mis à jour : ${status}`);
      refetch();
    } catch (error) {
      console.error('Error updating intervention status:', error);
      toast.error("Erreur lors de la mise à jour du statut");
      throw error;
    }
  };

  // Assign technician to intervention
  const assignTechnician = async (id: number, technician: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update({ technician })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Technicien assigné : ${technician}`);
      refetch();
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast.error("Erreur lors de l'assignation du technicien");
      throw error;
    }
  };

  // Submit intervention report
  const submitInterventionReport = async (intervention: Partial<Intervention>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('interventions')
        .update(intervention)
        .eq('id', intervention.id);

      if (error) throw error;
      
      toast.success("Rapport d'intervention soumis avec succès");
      refetch();
    } catch (error) {
      console.error('Error submitting intervention report:', error);
      toast.error("Erreur lors de la soumission du rapport");
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
