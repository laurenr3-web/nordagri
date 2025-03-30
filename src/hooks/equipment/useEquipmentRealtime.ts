
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function useEquipmentRealtime() {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    // Create a channel for equipment changes
    try {
      const channel = supabase
        .channel('equipment-changes')
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'equipment' },
          (payload) => {
            console.log('Equipment table change detected:', payload);
            
            // Only process if component is still mounted
            if (isMountedRef.current) {
              // Invalidate queries to refresh data
              queryClient.invalidateQueries({ queryKey: ['equipment'] });
              
              // If it's an update to a specific equipment, also invalidate that query
              if (payload.new && typeof payload.new === 'object' && 'id' in payload.new) {
                queryClient.invalidateQueries({ 
                  queryKey: ['equipment', payload.new.id]
                });
              }
            }
          }
        )
        .subscribe((status) => {
          console.info('Equipment realtime subscription status:', status);
          if (isMountedRef.current) {
            setIsSubscribed(status === 'SUBSCRIBED');
          }
        });
      
      // Store channel reference for cleanup
      channelRef.current = channel;
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      if (isMountedRef.current) {
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Cleanup function
    return () => {
      // Mark component as unmounted
      isMountedRef.current = false;
      
      // Remove channel subscription if it exists
      if (channelRef.current) {
        console.info('Unsubscribing from equipment realtime updates');
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queryClient]);

  return { isSubscribed, error };
}
