
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/services/supabase/equipment/types';
import { cacheEquipments, getCachedEquipments } from '@/services/cache/equipmentCacheService';
import { useNetworkState } from '@/hooks/useNetworkState';

export interface EquipmentOption {
  id: number;
  name: string;
  value: string; // ID as string for UI component compatibility
  label: string; // Equipment name
}

export function useEquipments() {
  const isOnline = useNetworkState();

  return useQuery({
    queryKey: ['equipments'],
    queryFn: async (): Promise<EquipmentOption[]> => {
      try {
        // If user is offline, try to use cached data
        if (!isOnline) {
          const cachedData = getCachedEquipments();
          if (cachedData) {
            console.log('Using cached equipment data');
            return cachedData;
          }
        }

        // Fetch data from Supabase
        const { data: equipments, error } = await supabase
          .from('equipment')
          .select('id, name')
          .order('name');

        if (error) throw error;
        
        console.log('Raw equipment data:', equipments);
        
        // Convert equipment to the format expected by the MultiSelect component
        const formattedEquipments = equipments.map((equipment: any) => ({
          id: equipment.id,
          name: equipment.name,
          value: equipment.id.toString(),
          label: equipment.name
        }));
        
        console.log('Formatted equipment options:', formattedEquipments);
        
        // Cache data for offline use
        cacheEquipments(formattedEquipments);
        
        return formattedEquipments;
      } catch (error) {
        console.error('Error loading equipment:', error);
        
        // On error, try to use cached data
        const cachedData = getCachedEquipments();
        if (cachedData) {
          console.log('Using cached data after error');
          return cachedData;
        }
        
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (replaces cacheTime which is deprecated)
  });
}

// Validation for compatible equipment
export function useValidateCompatibility() {
  const isOnline = useNetworkState();

  return useQuery({
    queryKey: ['equipments-validation'],
    queryFn: async (): Promise<Set<number>> => {
      try {
        // If user is offline, try to use cached data
        if (!isOnline) {
          const cachedData = getCachedEquipments();
          if (cachedData) {
            console.log('Using cached data for validation');
            return new Set(cachedData.map(eq => parseInt(eq.value)));
          }
        }
        
        const { data: equipments, error } = await supabase
          .from('equipment')
          .select('id');

        if (error) throw error;
        
        console.log('Equipment IDs for validation:', equipments);
        
        // Create a Set for O(1) lookup
        const validIds = new Set(equipments.map((eq: any) => eq.id));
        console.log('Valid equipment IDs set:', Array.from(validIds));
        
        return validIds;
      } catch (error) {
        console.error('Error validating equipment:', error);
        
        // On error, try to use cached data for validation
        const cachedData = getCachedEquipments();
        if (cachedData) {
          console.log('Using cached data for validation after error');
          return new Set(cachedData.map(eq => parseInt(eq.value)));
        }
        
        return new Set();
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // Replaces cacheTime
  });
}
