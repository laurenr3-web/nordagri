
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/toast';
import { useAuthContext } from '@/providers/AuthProvider';

export interface StatsCardData {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
}

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: string;
  nextMaintenance: string | null;
}

export interface MaintenanceEvent {
  id: number;
  title: string;
  date: Date;
  status: string;
  equipment: string;
}

export interface AlertItem {
  id: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  date: Date;
  action?: string;
}

export interface UpcomingTask {
  id: number;
  title: string;
  equipment: string;
  date: Date;
  priority: string;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsCardData[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          fetchEquipment(),
          fetchMaintenance(),
          fetchAlerts(),
          fetchTasks()
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('owner_id', user?.id)
        .limit(4);

      if (error) {
        throw error;
      }

      if (data) {
        const mappedStats = data.map(item => ({
          title: item.title,
          value: item.value,
          icon: item.iconKey,
          change: item.change
        }));
        setStatsData(mappedStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, type, status, nextMaintenance')
        .eq('owner_id', user?.id)
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        setEquipmentData(data);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_schedule')
        .select('id, title, date, status, equipment')
        .eq('owner_id', user?.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);

      if (error) {
        throw error;
      }

      if (data) {
        setMaintenanceEvents(data.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          status: event.status,
          equipment: event.equipment
        })));
      }
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      // Alertes pour les pièces en dessous du seuil de réapprovisionnement
      const { data: lowPartsData, error: lowPartsError } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('owner_id', user?.id)
        .lt('quantity', 'reorder_threshold'); // Fixed: removed raw() method

      if (lowPartsError) {
        throw lowPartsError;
      }

      const lowPartsAlerts = lowPartsData
        ? lowPartsData.map(part => ({
          id: part.id,
          type: 'warning' as const,
          message: `Low stock: ${part.name} (Current: ${part.quantity}, Reorder at: ${part.reorder_threshold})`,
          date: new Date(),
          action: 'Reorder Parts'
        }))
        : [];

      // Alerte pour la maintenance en retard
      const { data: overdueMaintenanceData, error: overdueMaintenanceError } = await supabase
        .from('maintenance_schedule')
        .select('*')
        .eq('owner_id', user?.id)
        .lt('date', new Date().toISOString());

      if (overdueMaintenanceError) {
        throw overdueMaintenanceError;
      }

      const overdueMaintenanceAlerts = overdueMaintenanceData
        ? overdueMaintenanceData.map(maintenance => ({
          id: maintenance.id,
          type: 'error' as const,
          message: `Overdue maintenance: ${maintenance.title} due on ${new Date(maintenance.date).toLocaleDateString()}`,
          date: new Date(),
          action: 'Schedule Maintenance'
        }))
        : [];

      // Combine alerts
      const allAlerts = [...lowPartsAlerts, ...overdueMaintenanceAlerts];
      setAlertItems(allAlerts);

    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('owner_id', user?.id)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(5);

      if (error) {
        throw error;
      }

      if (data) {
        setUpcomingTasks(data.map(task => ({
          id: task.id,
          title: task.title,
          equipment: task.equipment,
          date: new Date(task.date),
          priority: task.priority
        })));
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  return {
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks
  };
};
