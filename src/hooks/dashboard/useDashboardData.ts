
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";

// Import specialized hooks
import { useStatsData } from './useStatsData';
import { useEquipmentData } from './useEquipmentData';
import { useMaintenanceData } from './useMaintenanceData';
import { useAlertsData } from './useAlertsData';
import { useTasksData } from './useTasksData';

// Export interfaces with all required properties
export interface StatsCardData {
  title: string;
  value: string | number;
  change?: number;
  status?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  image?: string;
  usage?: {
    hours: number;
    target: number;
  };
  nextService?: {
    type: string;
    due: string;
  };
  nextMaintenance?: string | null;
}

export interface MaintenanceEvent {
  id: string; // Changed to string to match CalendarView component expectations
  title: string;
  date: Date;
  equipment: string;
  status: string;
  priority: string;
  assignedTo: string;
  duration: number; // Required property
}

export interface AlertItem {
  id: number; // Changed to number to match AlertsSection component expectations
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  equipmentId: number;
  equipmentName: string;
  status: 'new' | 'acknowledged' | 'resolved';
  type: string;
  time: string; // Required property
  equipment: string; // Required property
}

export interface UpcomingTask {
  id: string | number;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
  priority: string;
  assignedTo: string;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Use specialized hooks
  const { statsData } = useStatsData(user);
  const { equipmentData } = useEquipmentData(user);
  const { maintenanceEvents } = useMaintenanceData(user);
  const { alertItems } = useAlertsData(user);
  const { upcomingTasks } = useTasksData(user);

  useEffect(() => {
    const isAllDataLoaded = 
      statsData.length > 0 || 
      equipmentData.length > 0 || 
      maintenanceEvents.length > 0 || 
      alertItems.length > 0 || 
      upcomingTasks.length > 0;

    if (isAllDataLoaded) {
      setLoading(false);
    }
  }, [statsData, equipmentData, maintenanceEvents, alertItems, upcomingTasks]);

  useEffect(() => {
    if (!user && !loading) {
      setLoading(false);
    }
  }, [user, loading]);

  return {
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks
  };
};
