
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface MaintenanceEvent {
  id: string | number;
  title: string;
  date: Date;
  equipment: string;
  status: string;
  priority: string;
  assignedTo: string;
}

export const useMaintenanceData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);

  useEffect(() => {
    fetchMaintenanceEvents();
  }, [user]);

  const fetchMaintenanceEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true })
        .limit(10);

      if (error) throw error;

      if (data) {
        const events: MaintenanceEvent[] = data.map(item => ({
          id: item.id,
          title: item.title,
          date: new Date(item.due_date),
          equipment: item.equipment,
          status: item.status,
          priority: item.priority,
          assignedTo: item.assigned_to || 'Non assigné'
        }));
        setMaintenanceEvents(events);
      }
    } catch (error) {
      console.error('Error fetching maintenance events:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les événements de maintenance.",
        variant: "destructive",
      });
      
      // Données par défaut en cas d'échec
      setMaintenanceEvents([
        {
          id: 1,
          title: "Vidange moteur",
          date: new Date(new Date().setDate(new Date().getDate() + 5)),
          equipment: "John Deere 8R 410",
          status: "scheduled",
          priority: "high",
          assignedTo: "Michael Torres"
        },
        {
          id: 2,
          title: "Remplacement filtre à air",
          date: new Date(new Date().setDate(new Date().getDate() + 10)),
          equipment: "Massey Ferguson 8S.245",
          status: "scheduled",
          priority: "medium",
          assignedTo: "David Chen"
        },
        {
          id: 3,
          title: "Contrôle système hydraulique",
          date: new Date(new Date().setDate(new Date().getDate() + 15)),
          equipment: "Fendt 942 Vario",
          status: "scheduled",
          priority: "low",
          assignedTo: "Sarah Johnson"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    maintenanceEvents
  };
};

export default useMaintenanceData;
