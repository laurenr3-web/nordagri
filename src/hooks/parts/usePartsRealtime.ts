
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getParts } from '@/services/supabase/parts';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export function usePartsRealtime() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    console.log('👂 Setting up parts realtime subscription');

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
            
            // Notify the user
            toast({
              title: "Inventaire mis à jour",
              description: "Les données des pièces ont été mises à jour",
            });
          }
        )
        .subscribe();
      
      setIsSubscribed(true);
      
      // Clean up subscription
      return () => {
        console.log('🛑 Removing parts realtime subscription');
        supabase.removeChannel(channel);
        setIsSubscribed(false);
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('Error setting up realtime subscription:', error);
      setError(error);
    }
  }, [queryClient, toast]);
  
  return { isSubscribed, error };
}
