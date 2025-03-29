
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useEquipmentRealtime() {
  const queryClient = useQueryClient();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const subscription = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    // Set up subscription only once
    if (!subscription.current) {
      try {
        // Use a timeout to ensure the component is fully mounted
        const timeoutId = setTimeout(() => {
          if (!isMountedRef.current) return;
          
          try {
            // Check if there's already a subscription
            if (subscription.current) {
              console.info('A realtime subscription already exists');
              return;
            }
            
            // Set up the subscription
            subscription.current = supabase
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
                    if (payload.new && payload.new.id) {
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
            
          } catch (error) {
            console.error('Error setting up realtime subscription:', error);
            if (isMountedRef.current) {
              setError(error instanceof Error ? error : new Error(String(error)));
            }
          }
        }, 1000);
        
        return () => {
          clearTimeout(timeoutId);
        };
      } catch (error) {
        console.error('Error in realtime subscription setup:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
      }
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      if (subscription.current) {
        console.info('Unsubscribing from equipment realtime updates');
        subscription.current.unsubscribe().then((status: string) => {
          console.info('Equipment realtime subscription status:', status);
        });
        subscription.current = null;
      }
    };
  }, [queryClient]);

  return { isSubscribed, error };
}
