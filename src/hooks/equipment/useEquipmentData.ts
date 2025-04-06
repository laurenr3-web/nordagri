
import { useStandardQuery } from '@/hooks/useStandardQuery';
import { getEquipment } from '@/services/supabase/equipment/queries';
import { Equipment } from '@/services/supabase/equipment/types';
import { useRealtimeCache } from '@/providers/RealtimeCacheProvider';
import { useState, useEffect } from 'react';

export function useEquipmentData() {
  const { isOfflineMode } = useRealtimeCache();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Utiliser le hook standardisé
  const { data, isLoading, error, isError, refetch } = useStandardQuery<Equipment[]>({
    queryKey: ['equipment'],
    queryFn: getEquipment,
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: [], // Données vides par défaut
    onSuccess: () => {
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    },
    onError: (err) => {
      console.error('Erreur lors du chargement des équipements:', err);
    }
  });

  // Gérer les données en mode hors ligne
  useEffect(() => {
    if (isOfflineMode && isInitialLoad && !data?.length) {
      // Afficher un message à l'utilisateur si nous n'avons pas de données en cache
      console.log('En mode hors ligne avec données limitées ou absentes');
    }
  }, [isOfflineMode, isInitialLoad, data]);

  return {
    equipment: data || [],
    isLoading,
    error: isError ? error : null,
    refetch
  };
}
