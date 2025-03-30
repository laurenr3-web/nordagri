
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuthContext } from '@/providers/AuthProvider';

export interface StatsCardData {
  title: string;
  value: number;
  change: number;
  icon: string;
}

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: string;
  lastMaintenance: string;
  nextMaintenance?: string;
}

export interface MaintenanceEvent {
  id: number;
  title: string;
  date: Date;
  status: string;
  priority: string;
  equipment: string;
}

export interface AlertItem {
  id: number;
  type: 'error' | 'warning' | 'info';
  message: string;
  date: Date;
  action?: string;
  actionPath?: string;
}

export interface UpcomingTask {
  id: number;
  title: string;
  date: Date;
  equipment: string;
  priority: string;
}

export const useDashboardData = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsCardData[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Charger les statistiques
        await fetchStatsData();
        
        // Charger les équipements
        await fetchEquipmentData();
        
        // Charger les événements de maintenance
        await fetchMaintenanceEvents();
        
        // Charger les alertes
        await fetchAlerts();
        
        // Charger les tâches à venir
        await fetchUpcomingTasks();
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord:', error);
        toast({
          title: 'Erreur de chargement',
          description: 'Impossible de charger les données du tableau de bord',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const fetchStatsData = async () => {
    try {
      // Équipement actif
      const { data: equipmentCount, error: equipmentError } = await supabase
        .from('equipment')
        .select('id', { count: 'exact' })
        .eq('owner_id', user?.id)
        .eq('status', 'active');

      // Tâches de maintenance
      const { data: maintenanceCount, error: maintenanceError } = await supabase
        .from('maintenance_tasks')
        .select('id', { count: 'exact' })
        .eq('owner_id', user?.id);

      // Inventaire des pièces
      const { data: partsCount, error: partsError } = await supabase
        .from('parts_inventory')
        .select('id', { count: 'exact' })
        .eq('owner_id', user?.id);

      // Interventions sur le terrain
      const { data: interventionsCount, error: interventionsError } = await supabase
        .from('interventions')
        .select('id', { count: 'exact' })
        .eq('owner_id', user?.id);

      // Traiter les données et les erreurs
      if (equipmentError || maintenanceError || partsError || interventionsError) {
        console.error('Erreurs lors de la récupération des statistiques:', 
          equipmentError, maintenanceError, partsError, interventionsError);
      }

      setStatsData([
        {
          title: 'Active Equipment',
          value: equipmentCount?.length || 0,
          change: 5,
          icon: 'tractor'
        },
        {
          title: 'Maintenance Tasks',
          value: maintenanceCount?.length || 0,
          change: -2,
          icon: 'wrench'
        },
        {
          title: 'Parts Inventory',
          value: partsCount?.length || 0,
          change: 10,
          icon: 'cog'
        },
        {
          title: 'Field Interventions',
          value: interventionsCount?.length || 0,
          change: 3,
          icon: 'map-pin'
        }
      ]);
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const fetchEquipmentData = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('owner_id', user?.id)
        .order('name')
        .limit(5);

      if (error) {
        throw error;
      }

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type || 'N/A',
          status: item.status || 'unknown',
          lastMaintenance: 'N/A', // À remplacer par des données réelles
          nextMaintenance: 'N/A'
        }));

        setEquipmentData(formattedData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
    }
  };

  const fetchMaintenanceEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', user?.id)
        .order('due_date');

      if (error) {
        throw error;
      }

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          title: item.title,
          date: new Date(item.due_date || new Date()),
          status: item.status,
          priority: item.priority,
          equipment: item.equipment
        }));

        setMaintenanceEvents(formattedData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des événements de maintenance:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      // Alertes pour les pièces en dessous du seuil de réapprovisionnement
      const { data: lowPartsData, error: lowPartsError } = await supabase
        .from('parts_inventory')
        .select('*')
        .eq('owner_id', user?.id)
        .lt('quantity', supabase.raw('reorder_threshold'));

      if (lowPartsError) {
        throw lowPartsError;
      }

      // Alertes pour les tâches de maintenance en retard
      const { data: overdueTasks, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', user?.id)
        .eq('status', 'overdue');

      if (tasksError) {
        throw tasksError;
      }

      // Formater les alertes
      const alerts: AlertItem[] = [];

      // Ajouter des alertes pour les pièces à réapprovisionner
      if (lowPartsData) {
        lowPartsData.forEach((part, index) => {
          alerts.push({
            id: index + 1,
            type: 'warning',
            message: `${part.name} inventory low (${part.quantity} remaining)`,
            date: new Date(),
            action: 'Reorder',
            actionPath: `/parts/order/${part.id}`
          });
        });
      }

      // Ajouter des alertes pour les tâches en retard
      if (overdueTasks) {
        overdueTasks.forEach((task, index) => {
          alerts.push({
            id: lowPartsData?.length ? lowPartsData.length + index + 1 : index + 1,
            type: 'error',
            message: `Overdue maintenance: ${task.title} for ${task.equipment}`,
            date: new Date(task.due_date || new Date()),
            action: 'View',
            actionPath: `/maintenance/${task.id}`
          });
        });
      }

      setAlertItems(alerts);
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
    }
  };

  const fetchUpcomingTasks = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      // Format des dates pour Supabase
      const todayStr = today.toISOString().split('T')[0];
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('owner_id', user?.id)
        .gte('due_date', todayStr)
        .lte('due_date', nextWeekStr)
        .not('status', 'eq', 'completed')
        .order('due_date');

      if (error) {
        throw error;
      }

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          title: item.title,
          date: new Date(item.due_date || new Date()),
          equipment: item.equipment,
          priority: item.priority
        }));

        setUpcomingTasks(formattedData);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches à venir:', error);
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
