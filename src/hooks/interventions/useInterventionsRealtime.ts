
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Intervention } from '@/types/Intervention';
import { toast } from 'sonner';

/**
 * Hook to subscribe to real-time updates for interventions
 */
export function useInterventionsRealtime() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  
  useEffect(() => {
    console.log('Setting up real-time subscription for interventions');
    
    // Set up the realtime subscription
    const channel = supabase
      .channel('interventions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interventions'
        },
        (payload) => {
          console.log('Realtime update for interventions:', payload);
          
          // Invalidate queries to refresh the data
          queryClient.invalidateQueries({ queryKey: ['interventions'] });
          
          // If a specific intervention is updated, also invalidate that query
          if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
            queryClient.invalidateQueries({ queryKey: ['interventions', payload.new.id] });
            
            // Show toast notification based on the event type
            if (payload.eventType === 'INSERT') {
              toast.info('Nouvelle intervention créée', {
                description: payload.new.title || 'Une nouvelle intervention a été ajoutée'
              });
            } else if (payload.eventType === 'UPDATE') {
              toast.info('Intervention mise à jour', {
                description: payload.new.title || 'Une intervention a été mise à jour'
              });
            } else if (payload.eventType === 'DELETE' && payload.old) {
              toast.info('Intervention supprimée', {
                description: 'Une intervention a été supprimée'
              });
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Interventions realtime subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to interventions realtime updates');
          setIsSubscribed(false);
          setError(new Error('Failed to subscribe to interventions updates'));
        } else {
          setIsSubscribed(false);
        }
      });

    // Clean up the subscription when the component unmounts
    return () => {
      console.log('Unsubscribing from interventions realtime updates');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { isSubscribed, error };
}
