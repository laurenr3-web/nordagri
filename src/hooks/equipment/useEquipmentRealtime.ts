
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Equipment } from '@/services/supabase/equipmentService';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to subscribe to equipment table changes
 */
export function useEquipmentRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up the realtime subscription
  const { status } = useRealtimeSubscription<Equipment>({
    table: 'equipment',
    onInsert: (payload) => {
      console.log('Equipment added:', payload.new);
      // Invalidate equipment queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      // Show a toast notification
      toast({
        title: 'Nouvel équipement ajouté',
        description: `${payload.new.name} a été ajouté à l'inventaire`,
      });
    },
    onUpdate: (payload) => {
      console.log('Equipment updated:', payload.new);
      
      // Update the equipment in the cache
      queryClient.setQueryData(['equipment', payload.new.id], payload.new);
      
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      toast({
        title: 'Équipement mis à jour',
        description: `${payload.new.name} a été mis à jour`,
      });
    },
    onDelete: (payload) => {
      console.log('Equipment deleted:', payload.old);
      
      // Invalidate equipment queries
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      toast({
        title: 'Équipement supprimé',
        description: `Un équipement a été supprimé de l'inventaire`,
      });
    }
  });
  
  useEffect(() => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to equipment table changes');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to equipment table changes');
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de recevoir les mises à jour en temps réel des équipements',
        variant: 'destructive',
      });
    }
  }, [status, toast]);
  
  return { status };
}
