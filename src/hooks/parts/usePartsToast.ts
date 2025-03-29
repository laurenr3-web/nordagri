
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const usePartsToast = (isError: boolean, initialParts: any[] = []) => {
  const { toast } = useToast();

  // Handle error cases
  useEffect(() => {
    if (isError && initialParts.length > 0) {
      console.log('⚠️ Using initial data due to Supabase error');
      toast({
        title: "Erreur de connexion",
        description: "Impossible de charger les données depuis Supabase",
        variant: "destructive",
      });
    }
  }, [isError, initialParts, toast]);

  return { toast };
};
