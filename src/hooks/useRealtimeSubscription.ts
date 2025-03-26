
import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Valid Supabase realtime event types
type SupabaseEventType = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Interface for table subscription configuration
interface SubscriptionConfig<T extends Record<string, any>> {
  tableName: string;
  eventTypes?: SupabaseEventType[];
  schema?: string;
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  filter?: string;
  showNotifications?: boolean;
}

/**
 * Custom hook to subscribe to Supabase table realtime changes
 */
export function useRealtimeSubscription<T extends Record<string, any>>({
  tableName,
  eventTypes = ['*'],
  schema = 'public',
  onInsert,
  onUpdate,
  onDelete,
  filter,
  showNotifications = true,
}: SubscriptionConfig<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Create a new channel
    const channelName = `table-changes-${tableName}`;
    let subscription = supabase.channel(channelName);
    
    // Configure the subscription for each event type
    for (const eventType of eventTypes) {
      // Set up base filter configuration
      const filterConfig: any = {
        schema: schema,
        table: tableName,
        event: eventType,
      };
      
      // Add optional filter
      if (filter) {
        filterConfig.filter = filter;
      }
      
      // Subscribe to PostgreSQL changes
      subscription = subscription.on(
        'postgres_changes' as any, 
        filterConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          // Process based on event type
          if (payload.eventType === 'INSERT') {
            if (onInsert) onInsert(payload);
            if (showNotifications) {
              toast({
                title: `Nouvel élément ajouté`,
                description: `Un nouvel élément a été ajouté dans ${tableName}`,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            if (onUpdate) onUpdate(payload);
            if (showNotifications) {
              toast({
                title: `Élément mis à jour`,
                description: `Un élément a été mis à jour dans ${tableName}`,
              });
            }
          } else if (payload.eventType === 'DELETE') {
            if (onDelete) onDelete(payload);
            if (showNotifications) {
              toast({
                title: `Élément supprimé`,
                description: `Un élément a été supprimé de ${tableName}`,
                variant: "destructive",
              });
            }
          }
        }
      );
    }

    // Subscribe to the channel
    subscription.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setIsSubscribed(true);
        console.log(`Successfully subscribed to ${tableName} table changes`);
      } else {
        console.log(`Subscription status for ${tableName}: ${status}`);
      }
    });

    // Store the channel for later access
    setChannel(subscription);

    // Clean up on component unmount
    return () => {
      supabase.removeChannel(subscription);
      console.log(`Unsubscribed from ${tableName} table changes`);
    };
  }, [tableName, JSON.stringify(eventTypes), schema, filter, showNotifications, toast]);

  return { channel, isSubscribed, error };
}
