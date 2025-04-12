
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';

export function usePartsData() {
  return useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      try {
        console.log('Fetching parts from Supabase...');
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user.id;

        if (!userId) {
          console.warn('User not authenticated, returning empty parts array');
          return [];
        }

        const { data, error } = await supabase
          .from('parts_inventory')
          .select('*')
          .eq('owner_id', userId);

        if (error) {
          console.error('Error fetching parts data:', error);
          throw error;
        }

        console.log(`Found ${data.length} parts in the database`, data);
        
        return data.map(part => ({
          id: part.id,
          name: part.name,
          partNumber: part.part_number || '',
          category: part.category || '',
          manufacturer: part.supplier || '',
          compatibility: part.compatible_with || [],
          stock: part.quantity,
          price: part.unit_price !== null ? part.unit_price : 0,
          location: part.location || '',
          reorderPoint: part.reorder_threshold || 5,
          image: part.image_url || 'https://placehold.co/400x300/png?text=No+Image'
        })) as Part[];
      } catch (error) {
        console.error('Error fetching parts data:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });
}
