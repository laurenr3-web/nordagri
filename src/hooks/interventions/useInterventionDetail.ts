
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';

export function useInterventionDetail(interventionId: string | number | undefined) {
  const queryClient = useQueryClient();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Fetch intervention details
  const {
    data: intervention,
    isLoading,
    error
  } = useQuery({
    queryKey: ['interventions', interventionId],
    queryFn: () => interventionId ? interventionService.getInterventionById(interventionId) : null,
    enabled: !!interventionId
  });
  
  // Update intervention mutation
  const updateMutation = useMutation({
    mutationFn: (updatedIntervention: Intervention) => {
      setIsUpdating(true);
      return interventionService.updateIntervention(updatedIntervention);
    },
    onSuccess: (updatedIntervention) => {
      // Update cache
      queryClient.setQueryData(['interventions', updatedIntervention.id], updatedIntervention);
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      
      toast.success('Intervention mise à jour avec succès');
      setIsUpdating(false);
    },
    onError: (error: any) => {
      toast.error('Erreur lors de la mise à jour de l\'intervention', {
        description: error.message
      });
      setIsUpdating(false);
    }
  });
  
  // Handle intervention update
  const handleInterventionUpdate = (updatedIntervention: Intervention) => {
    updateMutation.mutate(updatedIntervention);
  };
  
  return {
    intervention,
    loading: isLoading,
    error,
    isUpdating,
    handleInterventionUpdate
  };
}
