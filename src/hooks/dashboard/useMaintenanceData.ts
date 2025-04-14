
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { MaintenanceEvent } from './types/dashboardTypes';

export const useMaintenanceData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaintenanceEvents();
  }, [user]);

  const fetchMaintenanceEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching maintenance events...");
      
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) {
        console.error("Error fetching maintenance tasks:", error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log(`Received ${data.length} maintenance tasks:`, data);
        
        const events: MaintenanceEvent[] = data.map(item => {
          // Convert priority to one of the allowed values
          let priority: 'low' | 'medium' | 'high' = 'medium';
          if (item.priority) {
            const lowerPriority = item.priority.toLowerCase();
            if (lowerPriority === 'low' || lowerPriority === 'medium' || lowerPriority === 'high') {
              priority = lowerPriority as 'low' | 'medium' | 'high';
            }
          }
          
          return {
            id: item.id,
            title: item.title,
            date: new Date(item.due_date),
            equipment: item.equipment,
            status: item.status,
            priority: priority,
            assignedTo: item.assigned_to || 'Non assigné',
            duration: item.estimated_duration || 0
          };
        });
        
        console.log("Transformed maintenance events:", events);
        setMaintenanceEvents(events);
      } else {
        console.log("No maintenance tasks found in the database");
        
        // En mode développement uniquement, utiliser des données de test
        if (import.meta.env.DEV) {
          setMaintenanceEvents([
            {
              id: 1,
              title: "Vidange moteur",
              date: new Date(new Date().setDate(new Date().getDate() + 5)),
              equipment: "John Deere 8R 410",
              status: "scheduled",
              priority: "high",
              assignedTo: "Michael Torres",
              duration: 2.5
            },
            {
              id: 2,
              title: "Remplacement filtre à air",
              date: new Date(new Date().setDate(new Date().getDate() + 10)),
              equipment: "Massey Ferguson 8S.245",
              status: "scheduled",
              priority: "medium",
              assignedTo: "David Chen",
              duration: 1
            },
            {
              id: 3,
              title: "Contrôle système hydraulique",
              date: new Date(new Date().setDate(new Date().getDate() + 15)),
              equipment: "Fendt 942 Vario",
              status: "scheduled",
              priority: "low",
              assignedTo: "Sarah Johnson",
              duration: 3
            }
          ]);
        }
      }
    } catch (error: any) {
      console.error('Error fetching maintenance events:', error);
      setError(error.message || "Une erreur est survenue lors de la récupération des événements de maintenance");
      
      // En mode développement uniquement, utiliser des données de test en cas d'erreur
      if (import.meta.env.DEV) {
        setMaintenanceEvents([
          {
            id: 1,
            title: "Vidange moteur",
            date: new Date(new Date().setDate(new Date().getDate() + 5)),
            equipment: "John Deere 8R 410",
            status: "scheduled",
            priority: "high",
            assignedTo: "Michael Torres",
            duration: 2.5
          },
          {
            id: 2,
            title: "Remplacement filtre à air",
            date: new Date(new Date().setDate(new Date().getDate() + 10)),
            equipment: "Massey Ferguson 8S.245",
            status: "scheduled",
            priority: "medium",
            assignedTo: "David Chen",
            duration: 1
          },
          {
            id: 3,
            title: "Contrôle système hydraulique",
            date: new Date(new Date().setDate(new Date().getDate() + 15)),
            equipment: "Fendt 942 Vario",
            status: "scheduled",
            priority: "low",
            assignedTo: "Sarah Johnson",
            duration: 3
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    maintenanceEvents,
    error,
    refresh: fetchMaintenanceEvents
  };
};

export default useMaintenanceData;
