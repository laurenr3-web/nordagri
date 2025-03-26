
import { useEffect, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesFilter, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type SubscriptionEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

// Define interfaces for the callback payloads
interface InsertPayload<T> {
  new: T;
}

interface UpdatePayload<T> {
  new: T;
  old: T;
}

interface DeletePayload<T> {
  old: T;
}

interface UseRealtimeSubscriptionOptions<T> {
  table: string;
  events?: SubscriptionEvent[];
  schema?: string;
  filter?: string;
  filterValues?: any[];
  onInsert?: (payload: InsertPayload<T>) => void;
  onUpdate?: (payload: UpdatePayload<T>) => void;
  onDelete?: (payload: DeletePayload<T>) => void;
  onAll?: (payload: RealtimePostgresChangesPayload<T>, event: SubscriptionEvent) => void;
}

/**
 * Hook to subscribe to Supabase realtime changes
 * @param options Configuration for the realtime subscription
 * @returns An object containing the channel and subscription status
 */
export function useRealtimeSubscription<T extends Record<string, any>>({
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
      // Create filter for the postgres_changes event
      const filterOptions: RealtimePostgresChangesFilter<T> = {
        event: event === '*' ? '*' : event,
        schema: schema,
        table: table,
      };
      
      if (filter) {
        filterOptions.filter = filter;
      }
      
      newChannel.on(
        'postgres_changes',
        filterOptions,
        (payload: RealtimePostgresChangesPayload<T>) => {
          console.log(`Received ${event} event for ${table}:`, payload);
          
          // Extract event type from payload
          const eventType = payload.eventType as SubscriptionEvent;
          
          if ((event === '*' || event === 'INSERT') && eventType === 'INSERT') {
            if (onInsert && payload.new) {
              onInsert({ new: payload.new as T });
            }
          }
          
          if ((event === '*' || event === 'UPDATE') && eventType === 'UPDATE') {
            if (onUpdate && payload.new && payload.old) {
              onUpdate({ 
                new: payload.new as T, 
                old: payload.old as T 
              });
            }
          }
          
          if ((event === '*' || event === 'DELETE') && eventType === 'DELETE') {
            if (onDelete && payload.old) {
              onDelete({ old: payload.old as T });
            }
          }
          
          if (onAll) {
            onAll(payload, eventType);
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
