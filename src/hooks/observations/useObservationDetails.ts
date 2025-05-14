
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getObservationById, deleteObservation } from '@/services/supabase/observations';
import { toast } from 'sonner';
import { FieldObservation } from '@/types/FieldObservation';

export const useObservationDetails = (observationId?: number) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: observation, isLoading, error } = useQuery({
    queryKey: ['observation', observationId],
    queryFn: () => observationId ? getObservationById(observationId) : null,
    enabled: !!observationId && isOpen,
  });

  const deleteObservationMutation = useMutation({
    mutationFn: (id: number) => deleteObservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['field-observations'] });
      queryClient.invalidateQueries({ queryKey: ['interventions'] });
      toast.success('Observation supprimée avec succès');
      setIsOpen(false);
    },
    onError: (error) => {
      console.error('Error deleting observation:', error);
      toast.error('Erreur lors de la suppression de l\'observation');
    },
  });

  const openObservationDetails = (id: number) => {
    setIsOpen(true);
  };

  const closeObservationDetails = () => {
    setIsOpen(false);
  };

  const handleDeleteObservation = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette observation ?')) {
      deleteObservationMutation.mutate(id);
    }
  };

  return {
    observation: observation as FieldObservation | null,
    isLoading,
    error,
    isOpen,
    openObservationDetails,
    closeObservationDetails,
    handleDeleteObservation,
    isDeleting: deleteObservationMutation.isPending,
  };
};
