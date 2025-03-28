
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
          table: 'equipments'
        },
        (payload) => {
          console.log('Realtime update for equipment:', payload);
          
          // Invalidate queries to refresh the equipment data
          queryClient.invalidateQueries({ queryKey: ['equipment'] });
          
          // If a specific equipment is updated, also invalidate that query
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new && payload.new.id) {
            queryClient.invalidateQueries({ queryKey: ['equipment', payload.new.id] });
          }
          
          // Invalidate stats query
          queryClient.invalidateQueries({ queryKey: ['equipment-stats'] });
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
