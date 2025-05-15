
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '@/core/equipment';

/**
 * Hook to fetch equipment data from Supabase
 */
export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      try {
        console.log('Fetching equipment data for dropdown');
        const equipments = await equipmentService.getEquipment();
        return equipments;
      } catch (error) {
        console.error('Error fetching equipment data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}
