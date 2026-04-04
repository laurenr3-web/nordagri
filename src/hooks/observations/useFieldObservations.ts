
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldObservation, FieldObservationFormValues } from '@/types/FieldObservation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { assertIsDefined } from '@/utils/typeAssertions';

export const useFieldObservations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: observations = [], isLoading, error } = useQuery({
    queryKey: ['field-observations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('interventions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erreur lors du chargement des observations:', error);
          toast.error('Erreur lors du chargement des observations');
          throw error;
        }

        return (data || []).map((item: any) => ({
          ...item,
          observer_id: item.owner_id,
          observation_type: item.type || 'general',
          urgency_level: item.priority || 'low',
          photos: [],
        })) as FieldObservation[];
      } catch (err) {
        console.error('Exception lors du chargement des observations:', err);
        throw err;
      }
    }
  });

  const createObservation = useMutation({
    mutationFn: async (values: FieldObservationFormValues) => {
      if (!user?.id) {
        toast.error('Vous devez être connecté pour créer une observation');
        throw new Error('User not authenticated');
      }

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
          console.error('Erreur de session:', sessionError);
          toast.error('Votre session a expiré. Veuillez vous reconnecter.');
          throw new Error('Session expired or invalid');
        }

        const userData = assertIsDefined(sessionData.session.user, 'Session user');
        
        const insertData: any = {
          equipment_id: values.equipment_id,
          equipment: values.equipment,
          location: values.location || 'Non spécifiée',
          description: values.description || '',
          status: 'pending',
          priority: values.urgency_level === 'urgent' ? 'high' : (values.urgency_level === 'surveiller' ? 'medium' : 'low'),
          date: new Date().toISOString(),
          technician: 'À assigner',
          title: `Observation: ${values.equipment} - ${values.observation_type}`,
          owner_id: userData.id
        };

        const { data, error } = await supabase
          .from('interventions')
          .insert(insertData)
          .select();

        if (error) {
          console.error("Erreur de création de l'observation:", error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error("Erreur lors de la création de l'observation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-observations'] });
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Observation enregistrée avec succès');
    },
    onError: (error: Error) => {
      console.error('Erreur mutation:', error);
      
      if (error.message.includes('Session expired')) {
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
      } else if (error.message.includes('violates row-level security policy')) {
        toast.error("Vous n'avez pas les permissions nécessaires pour créer une observation.");
      } else {
        toast.error("Erreur lors de la création de l'observation. Veuillez réessayer.");
      }
    }
  });

  return {
    observations,
    isLoading,
    error,
    createObservation
  };
};
