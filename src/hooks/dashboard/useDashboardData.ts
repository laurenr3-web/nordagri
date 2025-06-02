
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";

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
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Use specialized hooks
  const { statsData } = useStatsData(user);
  const { equipmentData } = useEquipmentData(user);
  const { maintenanceEvents } = useMaintenanceData(user);
  const { alertItems } = useAlertsData(user);
  const { upcomingTasks } = useTasksData(user);
  
  // New data fetching for additional dashboard features
  const interventionsResult = useInterventionsData();
  const partsResult = usePartsData();
  
  // Get the actual data from the query results
  const interventions = interventionsResult.interventions || [];
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

  useEffect(() => {
    const isAllDataLoaded = 
      statsData.length > 0 || 
      equipmentData.length > 0 || 
      maintenanceEvents.length > 0 || 
      alertItems.length > 0 || 
      upcomingTasks.length > 0 ||
      interventions.length > 0 ||
      parts.length > 0;

    if (isAllDataLoaded) {
      setLoading(false);
    }
  }, [statsData, equipmentData, maintenanceEvents, alertItems, upcomingTasks, interventions, parts]);

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
    upcomingTasks,
    urgentInterventions,
    stockAlerts,
    weeklyCalendarEvents
  };
};
