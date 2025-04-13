
import { useQuery } from '@tanstack/react-query';
import { interventionService } from '@/services/supabase/interventionService';
import { Intervention } from '@/types/Intervention';
import { useToast } from '@/hooks/use-toast';

export const useInterventionsData = () => {
  const { toast } = useToast();

  const { data: interventions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['interventions'],
    queryFn: async (): Promise<Intervention[]> => {
      try {
        return await interventionService.getInterventions();
      } catch (error: any) {
        console.error('Error fetching interventions:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de récupérer les interventions",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1
  });

  return {
    interventions,
    isLoading,
    error,
    refetch
  };
};

export default useInterventionsData;
