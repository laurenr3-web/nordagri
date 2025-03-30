
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";

// Import specialized hooks
import { useStatsData } from './useStatsData';
import { useEquipmentData } from './useEquipmentData';
import { useMaintenanceData } from './useMaintenanceData';
import { useAlertsData } from './useAlertsData';
import { useTasksData } from './useTasksData';

// Import types from specialized hooks
import type { StatsCardData } from './useStatsData';
import type { EquipmentItem } from './useEquipmentData';
import type { MaintenanceEvent } from './useMaintenanceData';
import type { AlertItem } from './useAlertsData';
import type { UpcomingTask } from './useTasksData';

// Re-export types for consumers
export type { StatsCardData, EquipmentItem, MaintenanceEvent, AlertItem, UpcomingTask };

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
