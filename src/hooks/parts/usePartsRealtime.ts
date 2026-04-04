
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
      // Only react to real database changes instead of using refetchInterval
      const channel = supabase
        .channel(`parts-changes-${Date.now()}-${Math.random().toString(36).slice(2,7)}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'parts_inventory',
          },
          async (payload) => {
            console.log('🔄 Realtime parts update received:', payload);
            
            // Invalidate query to trigger a refetch on next focus
            queryClient.invalidateQueries({ queryKey: ['parts'] });
            
            // Notify the user about the update
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
