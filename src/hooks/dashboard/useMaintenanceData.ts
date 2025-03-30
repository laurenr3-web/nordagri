import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

export interface MaintenanceEvent {
  id: number;
  title: string;
  date: Date;
  status: string;
  equipment: string;
}

export const useMaintenanceData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);

  useEffect(() => {
    fetchMaintenance();
  }, [user]);

  const setMockData = () => {
    setMaintenanceEvents([
      {
        id: 1,
        title: 'Oil Change - Tractor #1',
        date: new Date(2023, new Date().getMonth(), 8),
        status: 'scheduled',
        equipment: 'John Deere 8R 410'
      },
      {
        id: 2,
        title: 'Harvester Inspection',
        date: new Date(2023, new Date().getMonth(), 12),
        status: 'scheduled',
        equipment: 'Case IH Axial-Flow'
      }
    ]);
    setLoading(false);
  };

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      // Using maintenance_tasks table
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, status, equipment')
        .order('due_date', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const mappedEvents: MaintenanceEvent[] = data.map(task => ({
          id: task.id,
          title: task.title,
          date: new Date(task.due_date),
          status: task.status || 'scheduled',
          equipment: task.equipment
        }));
        setMaintenanceEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
      // If there's an error, let's set empty data so we don't break the UI
      setMaintenanceEvents([]);
      toast({
        title: "Error",
        description: "Failed to fetch maintenance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    maintenanceEvents,
    fetchMaintenance
  };
};
