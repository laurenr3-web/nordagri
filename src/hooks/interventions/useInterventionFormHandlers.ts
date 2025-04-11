
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { useInterventionsData } from './useInterventionsData';
import { useQueryClient } from '@tanstack/react-query';

interface UseInterventionFormHandlersProps {
  onClose: () => void;
}

/**
 * Hook personnalisé pour gérer les actions des formulaires d'intervention
 * - Séparation des préoccupations
 * - Réutilisation facile
 * - Gestion d'état optimisée
 */
export function useInterventionFormHandlers({ onClose }: UseInterventionFormHandlersProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createIntervention, updateInterventionStatus, submitInterventionReport } = useInterventionsData();
  const queryClient = useQueryClient();
  
  /**
   * Créer une nouvelle intervention
   */
  const handleCreateIntervention = useCallback(async (values: InterventionFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log('Creating new intervention with data:', values);
      await createIntervention(values);
      toast.success('Intervention créée avec succès');
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      onClose();
      return Promise.resolve();
    } catch (error: any) {
      toast.error(`Erreur lors de la création: ${error.message}`);
      console.error('Intervention creation error:', error);
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [createIntervention, queryClient, onClose]);
  
  /**
   * Démarrer une intervention
   */
  const handleStartIntervention = useCallback((intervention: Intervention) => {
    setIsSubmitting(true);
    
    try {
      updateInterventionStatus(intervention.id, 'in-progress');
      toast.success(`Intervention "${intervention.title}" démarrée`);
    } catch (error: any) {
      toast.error(`Erreur lors du démarrage: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [updateInterventionStatus]);
  
  /**
   * Soumettre un rapport d'intervention
   */
  const handleSubmitReport = useCallback((
    intervention: Intervention, 
    reportData: {
      duration: number;
      notes: string;
      partsUsed: Array<{ id: number; name: string; quantity: number; }>;
    }
  ) => {
    setIsSubmitting(true);
    
    try {
      submitInterventionReport(intervention, reportData);
      toast.success(`Rapport d'intervention soumis avec succès`);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      onClose();
    } catch (error: any) {
      toast.error(`Erreur lors de la soumission du rapport: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [submitInterventionReport, queryClient, onClose]);
  
  return {
    isSubmitting,
    handleCreateIntervention,
    handleStartIntervention,
    handleSubmitReport
  };
}
