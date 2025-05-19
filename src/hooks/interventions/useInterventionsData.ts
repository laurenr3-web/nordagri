
import { useState } from 'react';
import { interventionService } from '@/services/supabase/interventionService';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useInterventionsData() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer toutes les interventions
  const { data: interventions = [], isLoading: isLoadingInterventions, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      try {
        console.log('Fetching interventions from Supabase...');
        return await interventionService.getInterventions();
      } catch (error) {
        console.error('Error fetching interventions:', error);
        toast.error('Impossible de récupérer les interventions');
        return [];
      }
    }
  });

  // Mutation pour créer une intervention
  const createMutation = useMutation({
    mutationFn: (intervention: InterventionFormValues) => {
      setIsLoading(true);
      console.log('Creating intervention with data:', intervention);
      return interventionService.addIntervention(intervention);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Intervention créée avec succès');
      setIsLoading(false);
      refetch(); // Force refetch after creation
    },
    onError: (error: any) => {
      console.error('Error creating intervention:', error);
      toast.error(`Erreur lors de la création de l'intervention: ${error.message}`);
      setIsLoading(false);
    }
  });

  // Mutation pour mettre à jour le statut d'une intervention
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: Intervention['status'] }) => {
      setIsLoading(true);
      console.log(`Updating intervention ${id} status to ${status}`);
      return interventionService.updateInterventionStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Statut mis à jour avec succès');
      setIsLoading(false);
      refetch(); // Force refetch after status update
    },
    onError: (error: any) => {
      console.error('Error updating intervention status:', error);
      toast.error(`Erreur lors de la mise à jour du statut: ${error.message}`);
      setIsLoading(false);
    }
  });

  // Mutation pour mettre à jour une intervention
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<Intervention> }) => {
      setIsLoading(true);
      return interventionService.updateIntervention(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Intervention mise à jour avec succès');
      setIsLoading(false);
      refetch(); // Force refetch after update
    },
    onError: (error: any) => {
      console.error('Error updating intervention:', error);
      toast.error(`Erreur lors de la mise à jour de l'intervention: ${error.message}`);
      setIsLoading(false);
    }
  });

  // Créer une nouvelle intervention
  const createIntervention = async (intervention: InterventionFormValues) => {
    console.log('Creating intervention:', intervention);
    return createMutation.mutateAsync(intervention);
  };

  // Mettre à jour le statut d'une intervention
  const updateInterventionStatus = (id: number, status: Intervention['status']) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Assigner un technicien à une intervention
  const assignTechnician = (intervention: Intervention, technician: string) => {
    const updatedIntervention = { ...intervention, technician };
    updateMutation.mutate({ id: intervention.id, updates: updatedIntervention });
  };

  // Soumettre un rapport post-intervention
  const submitInterventionReport = (intervention: Intervention, report: {
    duration: number;
    notes: string;
    partsUsed: Array<{ id: number; name: string; quantity: number; }>;
  }) => {
    // Convert the partsUsed format to match what's expected by the Intervention type
    const updatedPartsUsed = report.partsUsed.map(part => ({
      id: part.id,
      name: part.name,
      quantity: part.quantity
    }));
    
    const updatedIntervention: Intervention = {
      ...intervention,
      status: 'completed',
      duration: report.duration,
      notes: report.notes,
      partsUsed: updatedPartsUsed
    };
    updateMutation.mutate({ id: intervention.id, updates: updatedIntervention });
  };

  return {
    interventions,
    isLoading: isLoading || isLoadingInterventions,
    createIntervention,
    updateInterventionStatus,
    assignTechnician,
    submitInterventionReport,
    refetch
  };
}
