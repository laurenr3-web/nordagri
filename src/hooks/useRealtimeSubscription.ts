
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

interface UseRealtimeSubscriptionOptions<T> {
  table: string;
  events?: SubscriptionEvent[];
  schema?: string;
  filter?: string;
  filterValues?: any[];
  onInsert?: (payload: { new: T }) => void;
  onUpdate?: (payload: { new: T; old: T }) => void;
  onDelete?: (payload: { old: T }) => void;
  onAll?: (payload: any, event: SubscriptionEvent) => void;
}

/**
 * Hook to subscribe to Supabase realtime changes
 * @param options Configuration for the realtime subscription
 * @returns An object containing the channel and subscription status
 */
export function useRealtimeSubscription<T>({
  table,
  events = ['*'],
  schema = 'public',
  filter,
  filterValues,
  onInsert,
  onUpdate,
  onDelete,
  onAll,
}: UseRealtimeSubscriptionOptions<T>) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [status, setStatus] = useState<'SUBSCRIBED' | 'CLOSED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | null>(null);

  useEffect(() => {
    // Create a new channel for the specified table
    const channelName = `realtime:${schema}:${table}`;
    console.log(`Setting up realtime subscription for ${channelName}`);
    
    const newChannel = supabase.channel(channelName);
    
    // Handle different events
    events.forEach((event) => {
      newChannel.on(
        'postgres_changes' as any, // Type cast to fix the error
        {
          event: event,
          schema: schema,
          table: table,
          filter: filter,
        },
        (payload) => {
          console.log(`Received ${event} event for ${table}:`, payload);
          
          if (event === '*' || event === 'INSERT') {
            if (onInsert && payload.eventType === 'INSERT') {
              onInsert(payload as { new: T });
            }
          }
          
          if (event === '*' || event === 'UPDATE') {
            if (onUpdate && payload.eventType === 'UPDATE') {
              onUpdate(payload as { new: T; old: T });
            }
          }
          
          if (event === '*' || event === 'DELETE') {
            if (onDelete && payload.eventType === 'DELETE') {
              onDelete(payload as { old: T });
            }
          }
          
          if (onAll) {
            onAll(payload, payload.eventType as SubscriptionEvent);
          }
        }
      );
    });
    
    // Subscribe to the channel
    newChannel.subscribe((status) => {
      console.log(`Subscription status for ${channelName}:`, status);
      setStatus(status);
    });
    
    setChannel(newChannel);
    
    // Cleanup: unsubscribe from the channel when the component unmounts
    return () => {
      console.log(`Cleaning up subscription for ${channelName}`);
      supabase.removeChannel(newChannel);
    };
  }, [table, JSON.stringify(events), schema, filter, JSON.stringify(filterValues)]);
  
  return { channel, status };
}
