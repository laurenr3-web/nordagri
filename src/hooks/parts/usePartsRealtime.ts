
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Hook to subscribe to parts_inventory table changes
 */
export function usePartsRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up the realtime subscription
  const { isSubscribed, error } = useRealtimeSubscription<Part>({
    tableName: 'parts_inventory',
    showNotifications: false,
    onInsert: (payload: RealtimePostgresChangesPayload<Part>) => {
      console.log('Part added:', payload.new);
      // Invalidate parts queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      // Show a toast notification
      if (payload.new && 'name' in payload.new) {
        toast({
          title: 'Nouvelle pièce ajoutée',
          description: `${payload.new.name} a été ajoutée à l'inventaire`,
        });
      }
    },
    onUpdate: (payload: RealtimePostgresChangesPayload<Part>) => {
      console.log('Part updated:', payload.new);
      
      if (payload.new && 'id' in payload.new) {
        // Update the part in the cache
        queryClient.setQueryData(['parts', payload.new.id], (oldData) => {
          return { ...(oldData as object || {}), ...payload.new };
        });
        
        // Check if stock level is below reorder point
        if (payload.new && 'quantity' in payload.new && 'reorder_threshold' in payload.new) {
          if (payload.new.quantity <= payload.new.reorder_threshold) {
            toast({
              title: 'Alerte de stock',
              description: payload.new && 'name' in payload.new ? 
                `${payload.new.name} est en dessous du seuil de réapprovisionnement` :
                `Une pièce est en dessous du seuil de réapprovisionnement`,
              variant: 'destructive',
            });
          }
        }
        
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: ['parts'] });
        
        if (payload.new && 'name' in payload.new) {
          toast({
            title: 'Pièce mise à jour',
            description: `${payload.new.name} a été mise à jour`,
          });
        }
      }
    },
    onDelete: (payload: RealtimePostgresChangesPayload<Part>) => {
      console.log('Part deleted:', payload.old);
      
      if (payload.old && 'id' in payload.old) {
        // Remove from cache if exists
        queryClient.removeQueries({ queryKey: ['parts', payload.old.id] });
      }
      
      // Invalidate parts queries
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      if (payload.old && 'name' in payload.old) {
        toast({
          title: 'Pièce supprimée',
          description: `${payload.old.name} a été supprimée de l'inventaire`,
        });
      } else {
        toast({
          title: 'Pièce supprimée',
          description: `Une pièce a été supprimée de l'inventaire`,
        });
      }
    }
  });
  
  useEffect(() => {
    if (isSubscribed) {
      console.log('Successfully subscribed to parts_inventory table changes');
    } else if (error) {
      console.error('Failed to subscribe to parts_inventory table changes:', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de recevoir les mises à jour en temps réel des pièces',
        variant: 'destructive',
      });
    }
  }, [isSubscribed, error, toast]);
  
  return { isSubscribed, error };
}
