
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to subscribe to maintenance_tasks table changes
 */
export function useMaintenanceRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Set up the realtime subscription
  const { status } = useRealtimeSubscription<MaintenanceTask>({
    table: 'maintenance_tasks',
    onInsert: (payload) => {
      console.log('Maintenance task added:', payload.new);
      // Invalidate maintenance queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      // Show a toast notification
      toast({
        title: 'Nouvelle tâche de maintenance',
        description: `${payload.new.title} a été ajoutée au calendrier`,
      });
    },
    onUpdate: (payload) => {
      console.log('Maintenance task updated:', payload.new);
      
      // Update the task in the cache
      queryClient.setQueryData(['maintenanceTasks', payload.new.id], payload.new);
      
      // Check if status changed to completed
      if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
        toast({
          title: 'Tâche terminée',
          description: `La tâche ${payload.new.title} a été marquée comme terminée`,
        });
      }
      
      // Check if due date is approaching for high priority tasks
      if (payload.new.priority === 'high') {
        const dueDate = new Date(payload.new.dueDate);
        const today = new Date();
        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 2 && diffDays > 0) {
          toast({
            title: 'Rappel de maintenance',
            description: `La tâche prioritaire ${payload.new.title} est due dans ${diffDays} jour(s)`,
            variant: 'destructive',
          });
        }
      }
      
      // Invalidate the list query
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      toast({
        title: 'Tâche mise à jour',
        description: `${payload.new.title} a été mise à jour`,
      });
    },
    onDelete: (payload) => {
      console.log('Maintenance task deleted:', payload.old);
      
      // Invalidate maintenance queries
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      
      toast({
        title: 'Tâche supprimée',
        description: `Une tâche de maintenance a été supprimée`,
      });
    }
  });
  
  useEffect(() => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed to maintenance_tasks table changes');
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Failed to subscribe to maintenance_tasks table changes');
      toast({
        title: 'Erreur de connexion',
        description: 'Impossible de recevoir les mises à jour en temps réel des tâches',
        variant: 'destructive',
      });
    }
  }, [status, toast]);
  
  return { status };
}
