
import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { Intervention, InterventionFormValues, InterventionReportData } from '@/types/Intervention';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const useInterventionsData = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: interventions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: async (): Promise<Intervention[]> => {
      try {
        return await interventionService.getInterventions();
      } catch (error: any) {
        console.error('Error fetching interventions:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les interventions",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  // CRUD operations for interventions
  const createIntervention = async (intervention: InterventionFormValues): Promise<Intervention> => {
    try {
      const newIntervention = await interventionService.addIntervention(intervention);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      return newIntervention;
    } catch (error: any) {
      toast({
        title: "Erreur de création",
        description: "Impossible de créer l'intervention",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInterventionStatus = async (id: number, status: string): Promise<void> => {
    try {
      await interventionService.updateInterventionStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    } catch (error: any) {
      toast({
        title: "Erreur de mise à jour",
        description: "Impossible de mettre à jour le statut de l'intervention",
        variant: "destructive",
      });
      throw error;
    }
  };

  const assignTechnician = async (id: number, technician: string): Promise<void> => {
    try {
      // Get the current intervention
      const intervention = interventions.find(i => i.id === id);
      if (!intervention) throw new Error("Intervention not found");

      // Update the intervention with the new technician
      await interventionService.updateIntervention({
        ...intervention,
        technician
      });
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    } catch (error: any) {
      toast({
        title: "Erreur d'assignation",
        description: "Impossible d'assigner le technicien",
        variant: "destructive",
      });
      throw error;
    }
  };

  const submitInterventionReport = async (
    intervention: Intervention,
    reportData: InterventionReportData
  ): Promise<void> => {
    try {
      // Update the intervention with report data
      const updatedIntervention = {
        ...intervention,
        status: 'completed',
        duration: reportData.duration,
        notes: reportData.notes,
        partsUsed: reportData.partsUsed
      };
      
      await interventionService.updateIntervention(updatedIntervention);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
    } catch (error: any) {
      toast({
        title: "Erreur de soumission",
        description: "Impossible de soumettre le rapport d'intervention",
        variant: "destructive",
      });
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

export default useInterventionsData;
