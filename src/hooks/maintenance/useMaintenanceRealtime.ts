
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook to subscribe to real-time updates for maintenance tasks
 */
export function useMaintenanceRealtime() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Set up the realtime subscription
    const channel = supabase
      .channel('maintenance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_records'
        },
        (payload) => {
          console.log('Realtime update for maintenance:', payload);
          
          // Invalidate queries to refresh the maintenance data
          queryClient.invalidateQueries({ queryKey: ['maintenance'] });
          queryClient.invalidateQueries({ queryKey: ['maintenance-tasks'] });
          
          // If a specific maintenance task is updated, also invalidate that query
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['maintenance', payload.new.id] });
          }
        }
      )
      .subscribe((status) => {
        console.log('Maintenance realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to maintenance realtime updates');
          setIsSubscribed(false);
          setError(new Error('Failed to subscribe to maintenance updates'));
        } else {
          setIsSubscribed(false);
        }
      });

    // Clean up the subscription when the component unmounts
    return () => {
      console.log('Unsubscribing from maintenance realtime updates');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { isSubscribed, error };
}
