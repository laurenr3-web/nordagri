
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Define the structure of the payload from Supabase
interface RealtimePayload<T> {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: SubscriptionEvent;
  new: T;
  old: T | null;
  errors: any | null;
}

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
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table,
          filter: filter,
        },
        (payload: any) => {
          console.log(`Received ${event} event for ${table}:`, payload);
          
          // Cast payload to our expected structure
          const realTimePayload = payload as unknown as RealtimePayload<T>;
          
          if (event === '*' || event === 'INSERT') {
            if (onInsert && realTimePayload.eventType === 'INSERT') {
              onInsert({ new: realTimePayload.new });
            }
          }
          
          if (event === '*' || event === 'UPDATE') {
            if (onUpdate && realTimePayload.eventType === 'UPDATE' && realTimePayload.old) {
              onUpdate({ new: realTimePayload.new, old: realTimePayload.old });
            }
          }
          
          if (event === '*' || event === 'DELETE') {
            if (onDelete && realTimePayload.eventType === 'DELETE' && realTimePayload.old) {
              onDelete({ old: realTimePayload.old });
            }
          }
          
          if (onAll) {
            onAll(realTimePayload, realTimePayload.eventType);
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
