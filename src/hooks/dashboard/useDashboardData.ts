
import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";
import { useQuery } from '@tanstack/react-query';

// Import des services
import { dashboardService } from '@/services/dashboard/dashboardService';
import { usePartsData } from '@/hooks/parts/usePartsData';

// Import des transformateurs
import { 
  deriveStockAlerts, 
  deriveUrgentInterventions,
  createCalendarEvents,
  filterWeeklyCalendarEvents,
  transformEquipmentData
} from '@/services/dashboard/transformers/dashboardDataTransformers';

// Export des types depuis le fichier de types
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

  // Requête pour les statistiques
  const { 
    data: statsData = [], 
    error: statsError,
    refetch: refreshStats
  } = useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: () => dashboardService.getStats(user?.id || ''),
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Requête pour les équipements
  const { 
    data: equipmentData = [], 
    error: equipmentError,
    refetch: refreshEquipment
  } = useQuery({
    queryKey: ['dashboard', 'equipment', user?.id],
    queryFn: () => dashboardService.getEquipment(user?.id || ''),
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Requête pour les événements de maintenance
  const { 
    data: maintenanceEvents = [], 
    error: maintenanceError,
    refetch: refreshMaintenance
  } = useQuery({
    queryKey: ['dashboard', 'maintenance', user?.id],
    queryFn: () => dashboardService.getMaintenanceEvents(user?.id || ''),
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Requête pour les alertes
  const { 
    data: alertItems = [], 
    error: alertsError,
    refetch: refreshAlerts
  } = useQuery({
    queryKey: ['dashboard', 'alerts', user?.id],
    queryFn: () => dashboardService.getAlerts(user?.id || ''),
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  // Requête pour les tâches
  const { 
    data: upcomingTasks = [], 
    error: tasksError,
    refetch: refreshTasks
  } = useQuery({
    queryKey: ['dashboard', 'tasks', user?.id],
    queryFn: () => dashboardService.getTasks(user?.id || ''),
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Requête pour les interventions
  const { 
    data: interventions = [], 
    isLoading: isLoadingInterventions,
    error: interventionsError,
    refetch: refreshInterventions
  } = useQuery({
    queryKey: ['interventions'],
    queryFn: () => dashboardService.getInterventions(),
    enabled: !!user,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
  
  // Utiliser le hook pour les pièces détachées
  const partsResult = usePartsData();
  const parts = partsResult.data || [];

  // Dériver les données secondaires à partir des données primaires
  const stockAlerts = deriveStockAlerts(parts);
  const urgentInterventions = deriveUrgentInterventions(interventions);
  const calendarEvents = createCalendarEvents(maintenanceEvents, interventions, upcomingTasks);
  const weeklyCalendarEvents = filterWeeklyCalendarEvents(calendarEvents);

  // Transformer les données des équipements
  const transformedEquipmentData = transformEquipmentData(equipmentData);

  // Mettre à jour les erreurs
  useEffect(() => {
    setErrors({
      stats: statsError ? String(statsError) : null,
      equipment: equipmentError ? String(equipmentError) : null,
      maintenance: maintenanceError ? String(maintenanceError) : null,
      alerts: alertsError ? String(alertsError) : null,
      tasks: tasksError ? String(tasksError) : null,
      interventions: interventionsError ? String(interventionsError) : null,
      parts: partsResult.error ? String(partsResult.error) : null
    });
  }, [
    statsError, 
    equipmentError, 
    maintenanceError, 
    alertsError, 
    tasksError, 
    interventionsError, 
    partsResult.error
  ]);

  // Fonction pour actualiser toutes les données
  const refreshData = useCallback(() => {
    setLoading(true);
    
    // Actualiser toutes les sources de données
    if (refreshStats) refreshStats();
    if (refreshEquipment) refreshEquipment();
    if (refreshMaintenance) refreshMaintenance();
    if (refreshAlerts) refreshAlerts();
    if (refreshTasks) refreshTasks();
    if (refreshInterventions) refreshInterventions();
    if (partsResult.refetch) partsResult.refetch();
    
    // Afficher un toast
    toast({
      title: "Actualisation",
      description: "Actualisation des données en cours...",
    });
    
    // Désactiver le chargement après un court délai
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
    partsResult.refetch,
    toast
  ]);

  // Déterminer quand arrêter l'état de chargement
  useEffect(() => {
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
  }, [
    statsData, 
    equipmentData, 
    maintenanceEvents, 
    alertItems, 
    upcomingTasks, 
    interventions, 
    parts, 
    isLoadingInterventions
  ]);

  // Arrêter le chargement si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!user && loading) {
      setLoading(false);
    }
  }, [user, loading]);

  return {
    loading,
    statsData,
    equipmentData: transformedEquipmentData,
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
