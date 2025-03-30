
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getParts } from '@/services/supabase/parts';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function usePartsRealtime() {
  // Hooks declarations first
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    console.log('👂 Setting up parts realtime subscription');
    // Mark component as mounted
    isMountedRef.current = true;

    try {
      const channel = supabase
        .channel('parts-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'parts_inventory',
          },
          async (payload) => {
            console.log('🔄 Realtime parts update received:', payload);
            
            // Only process if component is still mounted
            if (!isMountedRef.current) return;
            
            // Option 1: Simply invalidate the query to trigger a refetch
            queryClient.invalidateQueries({ queryKey: ['parts'] });
            
            // Option 2: Update the cache directly (more advanced)
            try {
              const currentParts = queryClient.getQueryData(['parts']);
              if (currentParts) {
                // For more complex updates, we might need different handling
                // based on the event type (INSERT, UPDATE, DELETE)
                const freshParts = await getParts();
                queryClient.setQueryData(['parts'], freshParts);
              }
            } catch (error) {
              console.error('Error updating parts cache:', error);
            }
            
            // Notify the user only if component is still mounted
            if (isMountedRef.current) {
              toast({
                title: "Inventaire mis à jour",
                description: "Les données des pièces ont été mises à jour",
              });
            }
          }
        )
        .subscribe();
      
      // Store channel reference for cleanup
      channelRef.current = channel;
      
      if (isMountedRef.current) {
        setIsSubscribed(true);
      }
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error setting up realtime subscription:', error);
      if (isMountedRef.current) {
        setError(error);
      }
    }
    
    // Clean up subscription
    return () => {
      console.log('🛑 Removing parts realtime subscription');
      isMountedRef.current = false;
      
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      
      setIsSubscribed(false);
    };
  }, [queryClient, toast]);
  
  return { isSubscribed, error };
}
