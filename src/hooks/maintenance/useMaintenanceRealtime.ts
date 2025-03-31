
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * Hook optimisé pour s'abonner aux changements de la table maintenance_tasks
 */
export function useMaintenanceRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up the realtime subscription with improved error handling
  const { isSubscribed, error } = useRealtimeSubscription<MaintenanceTask>({
    tableName: 'maintenance_tasks',
    showNotifications: false,
    onInsert: (payload: RealtimePostgresChangesPayload<MaintenanceTask>) => {
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
      console.log('Maintenance task updated:', payload.new);
      
      if (payload.new && 'id' in payload.new) {
        // Update the task in the cache
        queryClient.setQueryData(['maintenanceTasks', payload.new.id], (oldData) => {
          return { ...(oldData as object || {}), ...payload.new };
        });
        
        // Invalidate queries to reflect changes in lists
        queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
        
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
      }
    },
    onDelete: (payload: RealtimePostgresChangesPayload<MaintenanceTask>) => {
      console.log('Maintenance task deleted:', payload.old);
      
      if (payload.old && 'id' in payload.old) {
        // Remove the task from the cache
        queryClient.removeQueries({ queryKey: ['maintenanceTasks', payload.old.id] });
        
        // Invalidate queries to reflect changes in lists
        queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
        
        toast({
          title: 'Tâche supprimée',
          description: payload.old && 'title' in payload.old ? 
            `La tâche ${payload.old.title} a été supprimée` : 
            'Une tâche a été supprimée',
        });
      }
    }
  });
  
  // Log subscription status with improved messaging
  useEffect(() => {
    if (isSubscribed) {
      console.log('✅ Successfully subscribed to maintenance_tasks table changes');
    }
    if (error) {
      console.error('❌ Error subscribing to maintenance_tasks changes:', error);
      toast({
        title: 'Problème de connexion',
        description: 'La synchronisation des tâches de maintenance rencontre des problèmes. Certaines mises à jour pourraient être manquantes.',
        variant: 'destructive'
      });
    }
  }, [isSubscribed, error, toast]);
  
  return { isSubscribed, error };
}
