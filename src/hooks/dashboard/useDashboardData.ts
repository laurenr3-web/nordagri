
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

// Import specialized hooks
import { useStatsData } from './useStatsData';
import { useEquipmentData } from './useEquipmentData';
import { useMaintenanceData } from './useMaintenanceData';
import { useAlertsData } from './useAlertsData';
import { useTasksData } from './useTasksData';
import { interventionService } from '@/services/supabase/interventionService';
import { usePartsData } from '@/hooks/parts/usePartsData';

// Import utility functions
import { filterWeeklyCalendarEvents } from './utils/calendarUtils';
import { createCalendarEvents, deriveUrgentInterventions, deriveStockAlerts } from './utils/derivedDataUtils';

// Export types from the types file
export * from './types/dashboardTypes';

interface DashboardErrors {
  stats: string | null;
  equipment: string | null;
  maintenance: string | null;
  alerts: string | null;
  tasks: string | null;
  interventions: string | null;
  parts: string | null;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();
  const [errors, setErrors] = useState<DashboardErrors>({
    stats: null,
    equipment: null,
    maintenance: null,
    alerts: null,
    tasks: null,
    interventions: null,
    parts: null
  });

  // Use specialized hooks
  const { statsData, error: statsError, refresh: refreshStats } = useStatsData(user);
  const { equipmentData, error: equipmentError, refresh: refreshEquipment } = useEquipmentData(user);
  const { maintenanceEvents, error: maintenanceError, refresh: refreshMaintenance } = useMaintenanceData(user);
  const { alertItems, error: alertsError, refresh: refreshAlerts } = useAlertsData(user);
  const { upcomingTasks, error: tasksError, retry: refreshTasks } = useTasksData(user);
  
  // Use React Query to fetch interventions
  const { 
    data: interventions = [], 
    isLoading: isLoadingInterventions,
    error: interventionsError,
    refetch: refreshInterventions
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => interventionService.getInterventions(),
    enabled: !!user
  });
  
  const partsResult = usePartsData();
  
  // Get the actual parts data
  const parts = partsResult.data || [];

  // Derive urgent interventions from interventions data
  const urgentInterventions = deriveUrgentInterventions(interventions);

  // Derive stock alerts from parts data
  const stockAlerts = deriveStockAlerts(parts);

  // Create calendar events combining maintenance, interventions, and tasks
  const calendarEvents = createCalendarEvents(
    maintenanceEvents,
    interventions,
    upcomingTasks
  );

  // Filter calendar events to show only this week's events
  const weeklyCalendarEvents = filterWeeklyCalendarEvents(calendarEvents);

  // Update errors state when individual hook errors change
  useEffect(() => {
    setErrors({
      stats: statsError,
      equipment: equipmentError,
      maintenance: maintenanceError,
      alerts: alertsError,
      tasks: tasksError,
      interventions: interventionsError ? String(interventionsError) : null,
      parts: partsResult.error ? String(partsResult.error) : null
    });
  }, [statsError, equipmentError, maintenanceError, alertsError, tasksError, interventionsError, partsResult.error]);

  // Function to refresh all data
  const refreshData = useCallback(() => {
    setLoading(true);
    
    // Refresh all data sources
    if (refreshStats) refreshStats();
    if (refreshEquipment) refreshEquipment();
    if (refreshMaintenance) refreshMaintenance();
    if (refreshAlerts) refreshAlerts();
    if (refreshTasks) refreshTasks();
    if (refreshInterventions) refreshInterventions();
    if (partsResult.refetch) partsResult.refetch();
    
    // Use standard toast
    toast({
      title: "Actualisation",
      description: "Actualisation des données en cours...",
    });
    
    // Set loading to false after a short delay to ensure all data has been refreshed
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [
    refreshStats, 
    refreshEquipment, 
    refreshMaintenance, 
    refreshAlerts, 
    refreshTasks, 
    refreshInterventions, 
    partsResult.refetch
  ]);

  useEffect(() => {
    // Si on a des données dans au moins une des sources, c'est suffisant pour ne plus montrer le loader
    const isAnyDataLoaded = 
      statsData.length > 0 || 
      equipmentData.length > 0 || 
      maintenanceEvents.length > 0 || 
      alertItems.length > 0 || 
      upcomingTasks.length > 0 ||
      interventions.length > 0 ||
      parts.length > 0;

    if (isAnyDataLoaded && !isLoadingInterventions) {
      setLoading(false);
    }
  }, [statsData, equipmentData, maintenanceEvents, alertItems, upcomingTasks, interventions, parts, isLoadingInterventions]);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté mais que le chargement est en cours, on arrête le loader
    if (!user && loading) {
      setLoading(false);
    }
  }, [user, loading]);

  return {
    loading: false, // Force loading to false to ensure the dashboard shows
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    urgentInterventions,
    stockAlerts,
    weeklyCalendarEvents,
    errors,
    refreshData
  };
};

export default useDashboardData;
