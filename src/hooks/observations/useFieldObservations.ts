
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FieldObservation, FieldObservationFormValues } from '@/types/FieldObservation';
import { toast } from 'sonner';

export function useFieldObservations() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer toutes les observations terrain
  const { data: observations = [], isLoading: isLoadingObservations } = useQuery({
    queryKey: ['observations'],
    queryFn: async (): Promise<FieldObservation[]> => {
      try {
        const { data, error } = await supabase
          .from('interventions')
          .select('*')
          .not('observation_type', 'is', null)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching field observations:', error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error('Error in field observations query:', error);
        toast.error('Impossible de récupérer les observations terrain');
        return [];
      }
    }
  });

  // Mutation pour créer une nouvelle observation
  const createMutation = useMutation({
    mutationFn: async (observation: FieldObservationFormValues) => {
      setIsLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error('Utilisateur non authentifié');
      }
      
      const newObservation = {
        title: `Observation: ${observation.observation_type}`,
        equipment: observation.equipment,
        equipment_id: observation.equipment_id,
        location: observation.location || '',
        status: 'scheduled', // Statut par défaut pour compatibilité
        priority: observation.urgency_level === 'urgent' ? 'high' : 
                 observation.urgency_level === 'surveiller' ? 'medium' : 'low',
        date: new Date().toISOString(),
        description: observation.description,
        observer_id: userId,
        observation_type: observation.observation_type,
        urgency_level: observation.urgency_level,
        photos: observation.photos || [],
      };

      const { data, error } = await supabase
        .from('interventions')
        .insert(newObservation)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['observations'] });
      toast.success('Observation terrain ajoutée avec succès');
      setIsLoading(false);
    },
    onError: (error: any) => {
      console.error('Error creating field observation:', error);
      toast.error(`Erreur lors de la création de l'observation: ${error.message}`);
      setIsLoading(false);
    }
  });

  // Fonction pour filtrer les observations
  const filterObservations = (
    observations: FieldObservation[], 
    filters: {
      urgencyLevel?: string,
      equipmentId?: number,
      observationType?: string,
      dateRange?: { from: Date, to: Date }
    }
  ) => {
    return observations.filter(obs => {
      // Filtre par niveau d'urgence
      if (filters.urgencyLevel && obs.urgency_level !== filters.urgencyLevel) {
        return false;
      }
      
      // Filtre par équipement
      if (filters.equipmentId && obs.equipmentId !== filters.equipmentId) {
        return false;
      }
      
      // Filtre par type d'observation
      if (filters.observationType && obs.observation_type !== filters.observationType) {
        return false;
      }
      
      // Filtre par plage de dates
      if (filters.dateRange) {
        const obsDate = new Date(obs.date);
        if (
          obsDate < filters.dateRange.from || 
          obsDate > filters.dateRange.to
        ) {
          return false;
        }
      }
      
      return true;
    });
  };

  // Upload des photos
  const uploadPhotos = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `observations/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('field-observations')
        .upload(filePath, file);
      
      if (error) {
        console.error('Error uploading photo:', error);
        throw error;
      }
      
      // Retourner l'URL publique
      const { data: publicUrl } = supabase.storage
        .from('field-observations')
        .getPublicUrl(filePath);
        
      return publicUrl.publicUrl;
    });
    
    return Promise.all(uploadPromises);
  };

  return {
    observations,
    isLoading: isLoading || isLoadingObservations,
    createObservation: (observation: FieldObservationFormValues) => 
      createMutation.mutate(observation),
    filterObservations,
    uploadPhotos
  };
}
