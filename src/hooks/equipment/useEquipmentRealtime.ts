
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to subscribe to real-time updates for equipment
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
          console.log('Realtime update for equipment:', payload);
          
          // Handle DELETE event specifically
          if (payload.eventType === 'DELETE' && typeof payload.old === 'object' && 'id' in payload.old) {
            console.log('Equipment deleted via realtime:', payload.old.id);
            // Remove the deleted equipment from cache
            queryClient.setQueryData(['equipment', payload.old.id], undefined);
            // Force a refetch of all equipment-related queries
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            
            // Add a small delay before invalidating other queries to ensure the cache is cleared properly
            setTimeout(() => {
              console.log('Invalidating related queries after equipment deletion');
              queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              // Force refetch after a small delay to ensure UI updates
              queryClient.refetchQueries({ queryKey: ['equipment'] });
            }, 300);
          }
          // For all other events, just invalidate queries
          else {
            // Invalidate queries to refresh the equipment data
            queryClient.invalidateQueries({ queryKey: ['equipment'] });
            
            // If a specific equipment is updated, also invalidate that query
            if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
              queryClient.invalidateQueries({ queryKey: ['equipment', payload.new.id] });
            }
            
            // Invalidate stats query
            queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Equipment realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to equipment realtime updates');
          setIsSubscribed(false);
          setError(new Error('Failed to subscribe to equipment updates'));
        } else {
          setIsSubscribed(false);
        }
      });

    // Clean up the subscription when the component unmounts
    return () => {
      console.log('Unsubscribing from equipment realtime updates');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { isSubscribed, error };
}
