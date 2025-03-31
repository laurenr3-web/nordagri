
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '@/services/supabase/equipmentService';

export function useEquipmentOptions() {
  return useQuery({
    queryKey: ['equipment-options'],
    queryFn: async () => {
      try {
        const equipment = await equipmentService.getEquipment();
        
        // Format equipment for select dropdown
        return equipment.map(eq => ({
          id: eq.id,
          name: eq.name || `Équipement #${eq.id}`
        }));
      } catch (error) {
        console.error('Error fetching equipment options:', error);
        return [];
      }
    }
  });
}
