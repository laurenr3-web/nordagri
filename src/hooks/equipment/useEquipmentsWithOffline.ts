
import { useQueryWithOfflineSupport } from '../useQueryWithOfflineSupport';
import { useMutationWithOfflineSupport } from '../useMutationWithOfflineSupport';
import { Equipment } from '@/types/Equipment';
import { supabase } from '@/integrations/supabase/client';
import { OfflineSyncService } from '@/services/offline/offlineSyncService';

export function useEquipmentsWithOffline() {
  // Get all equipment with offline support
  const {
    data: equipments,
    isLoading,
    error,
    refetch
  } = useQueryWithOfflineSupport<Equipment[]>(
    ['equipments'],
    async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    {
      cacheKey: 'all_equipments',
      expirationMinutes: 24 * 60, // Cache for 24 hours
    }
  );

  // Add equipment with offline support
  const addEquipment = useMutationWithOfflineSupport({
    mutationFn: async (newEquipment: Omit<Equipment, 'id'>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(newEquipment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    offlineOptions: {
      type: 'add_equipment',
      onOfflineSuccess: () => {
        // Optionally update local UI immediately
        refetch();
      }
    }
  });

  // Get equipment by ID with offline support
  const getEquipmentById = async (id: number): Promise<Equipment | null> => {
    try {
      // Check offline cache first
      const cacheKey = `equipment_${id}`;
      const cachedEquipment = OfflineSyncService.getCachedData<Equipment>(cacheKey);
      
      if (cachedEquipment) {
        return cachedEquipment;
      }
      
      // If online or not in cache, fetch from Supabase
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Equipment not found
        }
        throw error;
      }
      
      // Cache for offline use
      OfflineSyncService.cacheData(cacheKey, data, 24 * 60);
      
      return data;
    } catch (error) {
      console.error(`Error fetching equipment ${id}:`, error);
      return null;
    }
  };

  return {
    equipments,
    isLoading,
    error,
    refetch,
    addEquipment,
    getEquipmentById
  };
}
