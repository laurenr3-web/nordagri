
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useMaintenanceRealtime = (
  onTaskInserted?: () => void,
  onTaskUpdated?: () => void,
  onTaskDeleted?: () => void
) => {
  useEffect(() => {
    // Configurer une écoute en temps réel pour les changements dans la table maintenance_tasks
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
      .subscribe();

    // Nettoyer en désinscrivant le canal lors du démontage du composant
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onTaskInserted, onTaskUpdated, onTaskDeleted]);
};
