
import { useState, useCallback } from 'react';
import { useInterventionsData } from './useInterventionsData';
import { InterventionFormValues } from '@/types/Intervention';
import { toast } from 'sonner';

interface UseInterventionFormHandlersProps {
  onClose?: () => void;
}

export const useInterventionFormHandlers = ({ onClose }: UseInterventionFormHandlersProps = {}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get the intervention data methods
  const { 
    createIntervention, 
    updateInterventionStatus, 
    submitInterventionReport 
  } = useInterventionsData();
  
  const handleCreateIntervention = useCallback(async (formData: InterventionFormValues) => {
    setIsSubmitting(true);
    try {
      await createIntervention(formData);
      toast.success('Intervention créée avec succès');
      if (onClose) onClose();
      return Promise.resolve();
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast.error("Erreur lors de la création de l'intervention");
      return Promise.reject(error);
    } finally {
      setIsSubmitting(false);
    }
  }, [createIntervention, onClose]);
  
  return {
    isSubmitting,
    handleCreateIntervention
  };
};
