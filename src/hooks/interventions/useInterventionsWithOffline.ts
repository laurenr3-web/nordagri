
import { useQueryWithOfflineSupport } from '@/hooks/useQueryWithOfflineSupport';
import { interventionService } from '@/services/supabase/interventionService';
import { useOfflineStatus } from '@/providers/OfflineProvider';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import { useTranslation } from 'react-i18next';

export function useInterventionsWithOffline() {
  const { isOnline } = useOfflineStatus();
  const { t } = useTranslation();
  const {
    createWithOfflineSupport,
    updateWithOfflineSupport,
    isItemQueued
  } = useOfflineSync<Intervention>('intervention');
  
  // Fetch interventions with offline support
  const { 
    data: interventions,
    isLoading,
    error,
    refetch,
    isOfflineData
  } = useQueryWithOfflineSupport<Intervention[]>(
    ['interventions'],
    () => interventionService.getInterventions(),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: isOnline
    },
    'interventions_cache'
  );
  
  // Create an intervention (with offline support)
  const createIntervention = async (intervention: any) => {
    try {
      return await createWithOfflineSupport(
        intervention,
        interventionService.addIntervention
      );
    } catch (error) {
      console.error('Error creating intervention:', error);
      toast.error(t("interventions.createError"));
      throw error;
    }
  };
  
  // Update an intervention (with offline support)
  const updateIntervention = async (intervention: Intervention) => {
    try {
      return await updateWithOfflineSupport(
        intervention,
        interventionService.updateIntervention
      );
    } catch (error) {
      console.error('Error updating intervention:', error);
      toast.error(t("interventions.updateError"));
      throw error;
    }
  };
  
  // Process interventions list to mark queued items
  const processedInterventions = interventions?.map(intervention => {
    if (isItemQueued(intervention.id)) {
      return {
        ...intervention,
        _isQueued: true
      };
    }
    return intervention;
  }) || [];

  return {
    interventions: processedInterventions,
    isLoading,
    error,
    refetch,
    isOfflineData,
    createIntervention,
    updateIntervention
  };
}
