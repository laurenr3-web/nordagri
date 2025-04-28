
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldObservation, FieldObservationFormValues } from '@/types/FieldObservation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useFieldObservations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: observations = [], isLoading } = useQuery({
    queryKey: ['field-observations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interventions')
        .select('*')
        .not('observation_type', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des observations:', error);
        toast.error('Erreur lors du chargement des observations');
        throw error;
      }

      return data as FieldObservation[];
    }
  });

  const createObservation = useMutation({
    mutationFn: async (values: FieldObservationFormValues) => {
      if (!user?.id) {
        toast.error('Vous devez être connecté pour créer une observation');
        throw new Error('User not authenticated');
      }

      try {
        // Créer une nouvelle intervention à partir de l'observation
        const { data, error } = await supabase
          .from('interventions')
          .insert({
            equipment_id: values.equipment_id,
            equipment: values.equipment,
            location: values.location || 'Non spécifiée',
            description: values.description || '',
            observation_type: values.observation_type,
            urgency_level: values.urgency_level,
            photos: values.photos || [],
            observer_id: user.id,
            status: 'pending',
            priority: values.urgency_level === 'urgent' ? 'high' : (values.urgency_level === 'surveiller' ? 'medium' : 'low'),
            date: new Date().toISOString(),
            technician: 'À assigner',
            title: `Observation: ${values.equipment} - ${values.observation_type}`
          })
          .select();

        if (error) {
          console.error('Erreur de création de l\'observation:', error);
          throw error;
        }

        return data;
      } catch (error) {
        console.error('Erreur lors de la création de l\'observation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-observations'] });
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Observation enregistrée avec succès');
    },
    onError: (error) => {
      console.error('Erreur mutation:', error);
      toast.error('Erreur lors de la création de l\'observation');
    }
  });

  return {
    observations,
    isLoading,
    createObservation
  };
};
