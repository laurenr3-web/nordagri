
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Equipment } from '@/services/supabase/equipmentService';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Hook to subscribe to equipment table changes
 */
export function useEquipmentRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up the realtime subscription
  const { isSubscribed, error } = useRealtimeSubscription<Equipment>({
    tableName: 'equipment',
    showNotifications: true, // Show notification toasts for equipment changes
    onInsert: (payload: RealtimePostgresChangesPayload<Equipment>) => {
      console.log('Equipment added:', payload.new);
      // Invalidate equipment queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      // Show a toast notification
      if (payload.new && 'name' in payload.new) {
        toast({
          title: 'Nouvel équipement ajouté',
          description: `${payload.new.name} a été ajouté à l'inventaire`,
        });
      }
    },
    onUpdate: (payload: RealtimePostgresChangesPayload<Equipment>) => {
      console.log('Equipment updated:', payload.new);
      
      if (payload.new && 'id' in payload.new) {
        // Update the equipment in the cache
        queryClient.setQueryData(['equipment', payload.new.id], (oldData) => {
          return { ...(oldData as object || {}), ...payload.new };
        });
        
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: ['equipment'] });
        
        if ('name' in payload.new) {
          toast({
            title: 'Équipement mis à jour',
            description: `${payload.new.name} a été mis à jour`,
          });
        }
      }
    },
    onDelete: (payload: RealtimePostgresChangesPayload<Equipment>) => {
      console.log('Equipment deleted:', payload.old);
      
      if (payload.old && 'id' in payload.old) {
        // Remove from cache if exists
        queryClient.removeQueries({ queryKey: ['equipment', payload.old.id] });
      }
      
      // Invalidate equipment queries
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      
      if (payload.old && 'name' in payload.old) {
        toast({
          title: 'Équipement supprimé',
          description: `${payload.old.name} a été supprimé de l'inventaire`,
        });
      } else {
        toast({
          title: 'Équipement supprimé',
          description: `Un équipement a été supprimé de l'inventaire`,
        });
      }
    }
  });
  
  useEffect(() => {
    if (isSubscribed) {
      console.log('Successfully subscribed to equipment table changes');
    } else if (error) {
      console.error('Failed to subscribe to equipment table changes:', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de recevoir les mises à jour en temps réel des équipements',
        variant: 'destructive',
      });
    }
  }, [isSubscribed, error, toast]);
  
  return { isSubscribed, error };
}
