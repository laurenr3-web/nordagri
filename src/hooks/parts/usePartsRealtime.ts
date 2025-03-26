
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to subscribe to parts_inventory table changes
 */
export function usePartsRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up the realtime subscription
  const { status } = useRealtimeSubscription<Part>({
    table: 'parts_inventory',
    onInsert: (payload) => {
      console.log('Part added:', payload.new);
      // Invalidate parts queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      // Show a toast notification
      toast({
        title: 'Nouvelle pièce ajoutée',
        description: `${payload.new.name} a été ajoutée à l'inventaire`,
      });
    },
    onUpdate: (payload) => {
      console.log('Part updated:', payload.new);
      
      // Update the part in the cache
      queryClient.setQueryData(['parts', payload.new.id], payload.new);
      
      // Check if stock level is below reorder point
      if (payload.new.stock <= payload.new.reorderPoint) {
        toast({
          title: 'Alerte de stock',
          description: `${payload.new.name} est en dessous du seuil de réapprovisionnement`,
          variant: 'destructive',
        });
      }
      
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: 'Pièce mise à jour',
        description: `${payload.new.name} a été mise à jour`,
      });
    },
    onDelete: (payload) => {
      console.log('Part deleted:', payload.old);
      
      // Invalidate parts queries
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: 'Pièce supprimée',
        description: `Une pièce a été supprimée de l'inventaire`,
      });
    }
  });
  
  useEffect(() => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to parts_inventory table changes');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to parts_inventory table changes');
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de recevoir les mises à jour en temps réel des pièces',
        variant: 'destructive',
      });
    }
  }, [status, toast]);
  
  return { status };
}
