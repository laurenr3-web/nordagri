
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
        toast.error('Erreur lors du chargement des observations');
        throw error;
      }

      return data as FieldObservation[];
    }
  });

  const createObservation = useMutation({
    mutationFn: async (values: FieldObservationFormValues) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('interventions')
        .insert({
          equipment_id: values.equipment_id,
          equipment: values.equipment,
          location: values.location,
          description: values.description,
          observation_type: values.observation_type,
          urgency_level: values.urgency_level,
          photos: values.photos,
          observer_id: user.id,
          status: 'pending',
          priority: values.urgency_level === 'urgent' ? 'high' : 'medium',
          date: new Date().toISOString(),
          technician: 'À assigner'
        });

      if (error) {
        toast.error('Erreur lors de la création de l\'observation');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-observations'] });
      toast.success('Observation enregistrée avec succès');
    }
  });

  return {
    observations,
    isLoading,
    createObservation
  };
};
