
import { useMemo } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';

// Import specialized hooks
import { useStatsData } from './useStatsData';
import { useEquipmentData } from './useEquipmentData';
import { useMaintenanceData } from './useMaintenanceData';
import { useAlertsData } from './useAlertsData';
import { useTasksData } from './useTasksData';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { usePartsData } from '@/hooks/parts/usePartsData';

// Import utility functions
import { filterWeeklyCalendarEvents } from './utils/calendarUtils';
import { deriveUrgentInterventions, deriveStockAlerts, createCalendarEvents } from './utils/derivedDataUtils';

// Export types from the types file
export * from './types/dashboardTypes';

/**
 * Hook principal pour la récupération et l'agrégation des données du tableau de bord
 * 
 * Ce hook combine les données de plusieurs sources (équipements, maintenance, 
 * interventions, alertes, etc.) pour alimenter le dashboard principal de l'application.
 * 
 * @returns {Object} Données agrégées pour le tableau de bord et état de chargement
 */
export const useDashboardData = () => {
  const { user } = useAuthContext();

  // Use specialized hooks
  const { loading: statsLoading, statsData } = useStatsData(user);
  const { loading: equipmentLoading, equipmentData } = useEquipmentData(user);
  const { loading: maintenanceLoading, maintenanceEvents } = useMaintenanceData(user);
  const { loading: alertsLoading, alertItems } = useAlertsData(user);
  const { loading: tasksLoading, upcomingTasks } = useTasksData(user);
  
  // New data fetching for additional dashboard features
  const { interventions = [], isLoading: interventionsLoading } = useInterventionsData();
  const { data: parts = [], isLoading: partsLoading } = usePartsData();
  
  const loading = useMemo(() => {
    return [
      statsLoading,
      equipmentLoading,
      maintenanceLoading,
      alertsLoading,
      tasksLoading,
      interventionsLoading,
      partsLoading,
    ].some(Boolean);
  }, [
    statsLoading,
    equipmentLoading,
    maintenanceLoading,
    alertsLoading,
    tasksLoading,
    interventionsLoading,
    partsLoading,
  ]);

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

  return {
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    urgentInterventions,
    stockAlerts,
    weeklyCalendarEvents
  };
};
