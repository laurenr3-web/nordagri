
import { useQuery } from '@tanstack/react-query';
import { getParts } from '@/services/supabase/parts';
import { partsData } from '@/data/partsData';
import { toast } from 'sonner';
import { useEffect } from 'react';

export function usePartsData() {
  const query = useQuery({
    queryKey: ['parts'],
    queryFn: async () => {
      try {
        console.log('Fetching parts from Supabase...');
        const parts = await getParts();
        
        // Log whether we're returning real data or sample data
        if (parts === partsData) {
          console.info('Returning sample data in usePartsData hook');
        } else {
          console.info(`Returning ${parts.length} real parts from the database`);
        }
        
        return parts;
      } catch (error) {
        console.error('Error fetching parts data:', error);
        toast.error("Erreur de chargement", {
          description: "Utilisation des données de démonstration à la place"
        });
        return partsData; // Return mock data as fallback
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });
  
  // Log error details for debugging
  useEffect(() => {
    if (query.error) {
      console.error('Parts query error details:', query.error);
    }
  }, [query.error]);

  return query;
}
