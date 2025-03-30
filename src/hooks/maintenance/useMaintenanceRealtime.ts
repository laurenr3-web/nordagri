
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Hook to subscribe to maintenance_tasks table changes
 */
export function useMaintenanceRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMountedRef = useRef(true);
  
  // Set up the realtime subscription
  const { isSubscribed, error } = useRealtimeSubscription<MaintenanceTask>({
    tableName: 'maintenance_tasks',
    showNotifications: false,
    onInsert: (payload: RealtimePostgresChangesPayload<MaintenanceTask>) => {
      if (!isMountedRef.current) return;
      
      console.log('Maintenance task added:', payload.new);
      // Invalidate maintenance queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      // Show a toast notification
      if (payload.new && 'title' in payload.new) {
        toast({
          title: 'Nouvelle tâche de maintenance',
          description: `${payload.new.title} a été ajoutée au calendrier`,
        });
      }
    },
    onUpdate: (payload: RealtimePostgresChangesPayload<MaintenanceTask>) => {
      if (!isMountedRef.current) return;
      
      console.log('Maintenance task updated:', payload.new);
      
      if (payload.new && 'id' in payload.new) {
        // Update the task in the cache
        queryClient.setQueryData(['maintenanceTasks', payload.new.id], (oldData) => {
          return { ...(oldData as object || {}), ...payload.new };
        });
        
        // Check if status changed to completed
        if (payload.new && 'status' in payload.new && payload.old && 'status' in payload.old) {
          if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
            toast({
              title: 'Tâche terminée',
              description: payload.new && 'title' in payload.new ? 
                `La tâche ${payload.new.title} a été marquée comme terminée` : 
                'Une tâche a été marquée comme terminée',
            });
          }
        }
        
        // Check if due date is approaching for high priority tasks
        if (payload.new && 'priority' in payload.new && payload.new.priority === 'high') {
          if (payload.new && 'dueDate' in payload.new) {
            const dueDate = new Date(payload.new.dueDate);
            const today = new Date();
            const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 2 && diffDays > 0) {
              toast({
                title: 'Rappel de maintenance',
                description: payload.new && 'title' in payload.new ? 
                  `La tâche prioritaire ${payload.new.title} est due dans ${diffDays} jour(s)` :
                  `Une tâche prioritaire est due dans ${diffDays} jour(s)`,
                variant: 'destructive',
              });
            }
          }
        }
        
        // Invalidate the list query
        queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
        
        if (payload.new && 'title' in payload.new) {
          toast({
            title: 'Tâche mise à jour',
            description: `${payload.new.title} a été mise à jour`,
          });
        }
      }
    },
    onDelete: (payload: RealtimePostgresChangesPayload<MaintenanceTask>) => {
      if (!isMountedRef.current) return;
      
      console.log('Maintenance task deleted:', payload.old);
      
      if (payload.old && 'id' in payload.old) {
        // Remove from cache if exists
        queryClient.removeQueries({ queryKey: ['maintenanceTasks', payload.old.id] });
      }
      
      // Invalidate maintenance queries
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      if (payload.old && 'title' in payload.old) {
        toast({
          title: 'Tâche supprimée',
          description: `${payload.old.title} a été supprimée`,
        });
      } else {
        toast({
          title: 'Tâche supprimée',
          description: `Une tâche de maintenance a été supprimée`,
        });
      }
    }
  });
  
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;
    
    if (isSubscribed) {
      console.log('Successfully subscribed to maintenance_tasks table changes');
    } else if (error) {
      console.error('Failed to subscribe to maintenance_tasks table changes:', error);
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de recevoir les mises à jour en temps réel des tâches',
        variant: 'destructive',
      });
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, [isSubscribed, error, toast]);
  
  return { isSubscribed, error };
}
