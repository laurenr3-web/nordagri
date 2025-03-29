
import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/supabase/equipmentService';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { getParts } from '@/services/supabase/parts';
import { interventionService } from '@/services/supabase/interventionService';
import { toast } from '@/hooks/use-toast';
// Import types
import { Stat, EquipmentItem, MaintenanceEvent, AlertItem, TaskItem } from './types';
// Import transformation functions
import { 
  transformStatsData, 
  transformEquipmentData, 
  transformMaintenanceEvents,
  transformAlerts,
  transformUpcomingTasks
} from './dashboardDataTransformers';
// Import mock data for fallback
import { 
  statsData as mockStatsData, 
  equipmentData as mockEquipmentData, 
  maintenanceEvents as mockMaintenanceEvents, 
  alertItems as mockAlertItems, 
  upcomingTasks as mockUpcomingTasks 
} from '@/data/dashboardData';

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Load all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsOfflineMode(false);

      // 1. Get equipment
      console.log('Chargement des données d\'équipement...');
      const equipment = await equipmentService.getEquipment();
      
      // 2. Get maintenance tasks
      console.log('Chargement des tâches de maintenance...');
      const maintenanceTasks = await maintenanceService.getTasks();
      
      // 3. Get parts
      console.log('Chargement des pièces détachées...');
      const parts = await getParts();
      
      // 4. Get interventions
      console.log('Chargement des interventions...');
      const interventions = await interventionService.getInterventions();
      
      // Vérification des données récupérées
      if (!equipment || equipment.length === 0) {
        console.warn('Aucun équipement trouvé dans la base de données');
      }
      
      if (!maintenanceTasks || maintenanceTasks.length === 0) {
        console.warn('Aucune tâche de maintenance trouvée dans la base de données');
      }
      
      if (!parts || parts.length === 0) {
        console.warn('Aucune pièce détachée trouvée dans la base de données');
      }
      
      if (!interventions || interventions.length === 0) {
        console.warn('Aucune intervention trouvée dans la base de données');
      }
      
      // Update all data sections using transformer functions
      setStatsData(transformStatsData(equipment || [], maintenanceTasks || [], parts || [], interventions || []));
      setEquipmentData(transformEquipmentData(equipment || [], maintenanceTasks || []));
      setMaintenanceEvents(transformMaintenanceEvents(maintenanceTasks || []));
      setAlertItems(transformAlerts(equipment || [], parts || [], maintenanceTasks || []));
      setUpcomingTasks(transformUpcomingTasks(maintenanceTasks || []));
      
    } catch (error) {
      console.error('Erreur lors du chargement des données du dashboard:', error);
      
      // Fallback to mock data in development mode
      console.log('Utilisation des données statiques en mode de développement');
      setStatsData(mockStatsData);
      setEquipmentData(mockEquipmentData);
      setMaintenanceEvents(mockMaintenanceEvents.map(event => ({
        ...event,
        date: new Date(event.date)
      })));
      setAlertItems(mockAlertItems);
      setUpcomingTasks(mockUpcomingTasks);
      setIsOfflineMode(true);
      
      toast({
        title: 'Mode hors ligne',
        description: 'Utilisation des données locales (connexion à la base de données indisponible)',
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    fetchDashboardData,
    error,
    isOfflineMode
  };
};

// Re-export types for convenience
export type { Stat, EquipmentItem, MaintenanceEvent, AlertItem, TaskItem };
