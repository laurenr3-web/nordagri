
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
    } else {
      // Use mock data when user is not logged in (for demo purposes)
      setMockData();
    }
  }, [user]);

  const setMockData = () => {
    // Setting mock data for demonstration when user is not logged in
    setStatsData([
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
    ]);

    // Mock equipment data
    setEquipmentData([
      { id: 1, name: 'John Deere 8R 410', type: 'Tractor', status: 'operational', nextMaintenance: 'In 3 weeks' },
      { id: 2, name: 'Case IH Axial-Flow', type: 'Combine Harvester', status: 'maintenance', nextMaintenance: 'In 2 days' },
      { id: 3, name: 'Kubota M7-172', type: 'Tractor', status: 'repair', nextMaintenance: 'Overdue' }
    ]);

    // Mock maintenance events
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

    // Mock alerts
    setAlertItems([
      {
        id: 1,
        type: 'error',
        message: 'Harvester engine overheating detected',
        date: new Date(),
        action: 'Check Engine'
      },
      {
        id: 2,
        type: 'warning',
        message: 'Low oil pressure warning on Tractor #3',
        date: new Date(),
        action: 'Schedule Service'
      }
    ]);

    // Mock tasks
    setUpcomingTasks([
      {
        id: 1,
        title: 'Oil and Filter Change',
        equipment: 'John Deere 8R 410',
        date: new Date(),
        priority: 'high'
      },
      {
        id: 2,
        title: 'Hydraulic System Check',
        equipment: 'Case IH Axial-Flow',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'medium'
      }
    ]);

    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      // Count active equipment
      const { count: equipmentCount, error: equipmentError } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id)
        .eq('status', 'operational');

      if (equipmentError) throw equipmentError;

      // Count maintenance tasks
      const { count: tasksCount, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      if (tasksError) throw tasksError;

      // Count parts inventory
      const { count: partsCount, error: partsError } = await supabase
        .from('parts_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      if (partsError) throw partsError;

      // Count field interventions
      const { count: interventionsCount, error: interventionsError } = await supabase
        .from('interventions')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      if (interventionsError) throw interventionsError;

      // Create stats data
      const newStatsData: StatsCardData[] = [
        {
          title: 'Active Equipment',
          value: equipmentCount || 0,
          icon: React.createElement(Tractor, { className: "text-primary h-5 w-5" }),
          change: 0 // We don't have change data yet
        },
        {
          title: 'Maintenance Tasks',
          value: tasksCount || 0,
          icon: React.createElement(Wrench, { className: "text-primary h-5 w-5" }),
          change: 0
        },
        {
          title: 'Parts Inventory',
          value: partsCount || 0,
          icon: React.createElement(Package, { className: "text-primary h-5 w-5" }),
          change: 0
        },
        {
          title: 'Field Interventions',
          value: interventionsCount || 0,
          icon: React.createElement(ClipboardCheck, { className: "text-primary h-5 w-5" }),
          change: 0
        }
      ];
      
      setStatsData(newStatsData);
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
          nextMaintenance: null // We'll have to calculate this separately
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
      const alerts: AlertItem[] = [];
      let alertId = 1;
      
      // Get low parts inventory
      const { data: lowPartsData, error: lowPartsError } = await supabase
        .from('parts_inventory')
        .select('id, name, quantity, reorder_threshold')
        .eq('owner_id', user?.id)
        .filter('quantity', 'lt', 'reorder_threshold');

      if (lowPartsError) {
        throw lowPartsError;
      }

      if (lowPartsData && lowPartsData.length > 0) {
        lowPartsData.forEach(part => {
          alerts.push({
            id: alertId++,
            type: 'warning',
            message: `Low stock: ${part.name} (Current: ${part.quantity}, Reorder at: ${part.reorder_threshold})`,
            date: new Date(),
            action: 'Reorder Parts'
          });
        });
      }

      // Get overdue maintenance
      const { data: overdueMaintenanceData, error: overdueMaintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, equipment')
        .eq('owner_id', user?.id)
        .eq('status', 'scheduled')
        .lt('due_date', new Date().toISOString());

      if (overdueMaintenanceError) {
        throw overdueMaintenanceError;
      }

      if (overdueMaintenanceData && overdueMaintenanceData.length > 0) {
        overdueMaintenanceData.forEach(maintenance => {
          alerts.push({
            id: alertId++,
            type: 'error',
            message: `Overdue maintenance: ${maintenance.title} due on ${new Date(maintenance.due_date).toLocaleDateString()}`,
            date: new Date(),
            action: 'Schedule Maintenance'
          });
        });
      }

      setAlertItems(alerts);
    } catch (error) {
      console.error('Error retrieving alerts:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      // Using maintenance_tasks
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('id, title, equipment, due_date, priority')
        .eq('owner_id', user?.id)
        .eq('status', 'scheduled')
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
