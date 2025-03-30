
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from '@/providers/AuthProvider';
import { Tractor, Wrench, Package, ClipboardCheck } from 'lucide-react';
import React from 'react';

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
      // Since the dashboard_stats table doesn't exist, let's create mock data
      const mockStatsData: StatsCardData[] = [
        {
          title: 'Active Equipment',
          value: 24,
          icon: React.createElement(Tractor, { className: "text-primary h-5 w-5" }),
          change: 4
        },
        {
          title: 'Maintenance Tasks',
          value: 12,
          icon: React.createElement(Wrench, { className: "text-primary h-5 w-5" }),
          change: -2
        },
        {
          title: 'Parts Inventory',
          value: 1204,
          icon: React.createElement(Package, { className: "text-primary h-5 w-5" }),
          change: 12
        },
        {
          title: 'Field Interventions',
          value: 8,
          icon: React.createElement(ClipboardCheck, { className: "text-primary h-5 w-5" }),
          change: 15
        }
      ];
      
      setStatsData(mockStatsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, type, status')
        .eq('owner_id', user?.id)
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match the EquipmentItem type
        const mappedEquipment: EquipmentItem[] = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'Unknown',
          status: item.status || 'operational',
          nextMaintenance: null // Since the column doesn't exist, we'll set it to null
        }));
        setEquipmentData(mappedEquipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const fetchMaintenance = async () => {
    try {
      // Using maintenance_tasks instead of maintenance_schedule
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, status, equipment')
        .eq('owner_id', user?.id)
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) {
        throw error;
      }

      if (data) {
        const mappedEvents: MaintenanceEvent[] = data.map(task => ({
          id: task.id,
          title: task.title,
          date: new Date(task.due_date),
          status: task.status,
          equipment: task.equipment
        }));
        setMaintenanceEvents(mappedEvents);
      }
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error);
    }
  };

  const fetchAlerts = async () => {
    try {
      // Get low parts inventory
      const { data: lowPartsData, error: lowPartsError } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('owner_id', user?.id)
        .lt('quantity', 'reorder_threshold');

      if (lowPartsError) {
        throw lowPartsError;
      }

      const lowPartsAlerts: AlertItem[] = lowPartsData
        ? lowPartsData.map(part => ({
          id: part.id,
          type: 'warning',
          message: `Low stock: ${part.name} (Current: ${part.quantity}, Reorder at: ${part.reorder_threshold})`,
          date: new Date(),
          action: 'Reorder Parts'
        }))
        : [];

      // Get overdue maintenance
      const { data: overdueMaintenanceData, error: overdueMaintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', user?.id)
        .lt('due_date', new Date().toISOString());

      if (overdueMaintenanceError) {
        throw overdueMaintenanceError;
      }

      const overdueMaintenanceAlerts: AlertItem[] = overdueMaintenanceData
        ? overdueMaintenanceData.map(maintenance => ({
          id: maintenance.id,
          type: 'error',
          message: `Overdue maintenance: ${maintenance.title} due on ${new Date(maintenance.due_date).toLocaleDateString()}`,
          date: new Date(),
          action: 'Schedule Maintenance'
        }))
        : [];

      // Combine alerts
      const allAlerts = [...lowPartsAlerts, ...overdueMaintenanceAlerts];
      setAlertItems(allAlerts);
    } catch (error) {
      console.error('Error retrieving alerts:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      // Using maintenance_tasks instead of tasks
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, equipment, due_date, priority')
        .eq('owner_id', user?.id)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) {
        throw error;
      }

      if (data) {
        const mappedTasks: UpcomingTask[] = data.map(task => ({
          id: task.id,
          title: task.title,
          equipment: task.equipment,
          date: new Date(task.due_date),
          priority: task.priority
        }));
        setUpcomingTasks(mappedTasks);
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
