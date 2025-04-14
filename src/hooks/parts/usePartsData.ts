
import { useQuery } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { getParts } from '@/services/supabase/parts';

export function usePartsData() {
  return useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      try {
        console.log('🔄 Calling getParts service function...');
        const partsData = await getParts();
        console.log('📦 Parts data received:', partsData);
        return partsData as Part[];
      } catch (error) {
        console.error('❌ Error fetching parts data:', error);
        // Return fallback empty array instead of using a global window property
        throw error;
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
