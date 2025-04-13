
import { useQuery } from '@tanstack/react-query';
import { getParts } from '@/services/supabase/parts';
import { partsData } from '@/data/partsData';
import { toast } from 'sonner';

export function usePartsData() {
  return useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      try {
        console.log('Fetching parts from Supabase...');
        return await getParts();
      } catch (error) {
        console.error('Error fetching parts data:', error);
        toast.error("Erreur de chargement", {
          description: "Utilisation des données de démonstration à la place"
        });
        return partsData; // Return mock data as fallback
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
}
