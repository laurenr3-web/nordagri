
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/utils/logger';

/**
 * Hook to subscribe to real-time updates for equipment
 * Optimized to avoid unnecessary refetching
 */
export function useEquipmentRealtime() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up the realtime subscription
    const channel = supabase
      .channel('equipment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment'
        },
        (payload) => {
          logger.log('Realtime update for equipment:', payload);
          
          // Handle DELETE event specifically
          if (payload.eventType === 'DELETE' && typeof payload.old === 'object' && 'id' in payload.old) {
            logger.log('Equipment deleted via realtime:', payload.old.id);
            // Remove the deleted equipment from cache
            queryClient.setQueryData(['equipment', payload.old.id], undefined);
            // Force a refetch of all equipment-related queries
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
          }
          // For all other events, just invalidate queries without immediate refetch
          else {
            // Invalidate queries to refresh on next focus
            queryClient.invalidateQueries({ queryKey: ['equipment'], refetchType: 'none' });
            
            // If a specific equipment is updated, also invalidate that query
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              queryClient.invalidateQueries({ 
                queryKey: ['equipment', payload.new.id],
                refetchType: 'none'
              });
            }
            
            // Invalidate stats query
            queryClient.invalidateQueries({ 
              queryKey: ['equipment-stats'],
              refetchType: 'none' 
            });
          }
        }
      )
      .subscribe((status) => {
        logger.log('Equipment realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          logger.error('Error subscribing to equipment realtime updates');
          setIsSubscribed(false);
          setError(new Error('Failed to subscribe to equipment updates'));
        } else {
          setIsSubscribed(false);
        }
      });

    // Clean up the subscription when the component unmounts
    return () => {
      logger.log('Unsubscribing from equipment realtime updates');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { isSubscribed, error };
}
