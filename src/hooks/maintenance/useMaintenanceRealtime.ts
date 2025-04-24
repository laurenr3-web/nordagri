
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMaintenanceRealtime = (
  onTaskInserted?: () => void,
  onTaskUpdated?: () => void,
  onTaskDeleted?: () => void
) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log("Setting up maintenance_tasks realtime subscription");
    // Configure realtime subscription for the maintenance_tasks table
    const channel = supabase
      .channel('maintenance_changes')
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'maintenance_tasks' 
        },
        (payload) => {
          console.log('Nouvelle tâche de maintenance détectée:', payload);
          toast.info('Nouvelle tâche de maintenance ajoutée');
          if (onTaskInserted) onTaskInserted();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'maintenance_tasks' 
        },
        (payload) => {
          console.log('Mise à jour d\'une tâche de maintenance:', payload);
          if (onTaskUpdated) onTaskUpdated();
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'maintenance_tasks' 
        },
        (payload) => {
          console.log('Suppression d\'une tâche de maintenance:', payload);
          if (onTaskDeleted) onTaskDeleted();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log("Successfully subscribed to maintenance_tasks table changes");
          setIsSubscribed(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Subscription error for maintenance_tasks: ${status}`);
          setIsSubscribed(false);
          setError(new Error(`Failed to subscribe to maintenance_tasks`));
        } else if (status === 'TIMED_OUT') {
          console.warn(`Subscription timed out for maintenance_tasks`);
          setIsSubscribed(false);
          setError(new Error('Subscription timed out'));
        } else {
          console.log(`Subscription status for maintenance_tasks: ${status}`);
        }
      });

    // Clean up by removing the channel when the component unmounts
    return () => {
      console.log("Unsubscribing from maintenance_tasks table changes");
      supabase.removeChannel(channel);
    };
  }, [onTaskInserted, onTaskUpdated, onTaskDeleted]);

  return { isSubscribed, error };
};
