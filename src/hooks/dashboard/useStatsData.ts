
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Tractor, Wrench, Package, MapPin } from 'lucide-react';
import React from 'react';

export interface StatsCardData {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  change: number;
  description?: string;
}

export const useStatsData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsCardData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatsData();
  }, [user]);

  const setDefaultStatsData = () => {
    setStatsData([
      {
        title: 'Active Equipment',
        value: '24',
        icon: Tractor,
        change: 4,
        description: ''
      }, {
        title: 'Maintenance Tasks',
        value: '12',
        icon: Wrench,
        description: '3 high priority',
        change: -2
      }, {
        title: 'Parts Inventory',
        value: '1,204',
        icon: Package,
        description: '8 items low stock',
        change: 12
      }, {
        title: 'Field Interventions',
        value: '8',
        icon: MapPin,
        description: 'This week',
        change: 15
      }
    ]);
  };

  const fetchStatsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Fetching dashboard stats data...");
      
      // Essayer de récupérer les données des équipements
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id');

      // Si erreur pour les équipements, essayer la table equipments (au pluriel)
      if (equipmentError) {
        console.log("Error fetching from 'equipment', trying 'equipments'");
        const { data: equipmentsData, error: equipmentsError } = await supabase
          .from('equipments')
          .select('id');
        
        // Si erreur pour les deux tables, lever une exception
        if (equipmentsError) {
          throw new Error("Failed to fetch equipment data from both tables");
        }
      }

      // Get maintenance tasks count
      const { data: tasksData, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('id, priority');

      if (tasksError) {
        console.error("Error fetching maintenance tasks:", tasksError);
      }

      // Get parts inventory count and total sum
      const { data: partsData, error: partsError } = await supabase
        .from('parts_inventory')
        .select('id, quantity, reorder_threshold');

      if (partsError) {
        console.error("Error fetching parts inventory:", partsError);
      }
      
      // Get interventions count (for this week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: interventionsData, error: interventionsError } = await supabase
        .from('interventions')
        .select('id')
        .gte('date', oneWeekAgo.toISOString());

      if (interventionsError) {
        console.error("Error fetching interventions:", interventionsError);
      }

      // Préparer les données des statistiques avec des valeurs par défaut si nécessaire
      const equipmentCount = equipmentData?.length || 0;
      const tasksCount = tasksData?.length || 0;
      const highPriorityTasks = tasksData?.filter(task => 
        task.priority === 'high' || task.priority === 'critical'
      ).length || 0;
      
      // Calculer le nombre total de types de pièces (sans la quantité)
      const totalPartsCount = partsData?.length || 0;
      
      // Calculer les éléments en stock faible
      const lowStockItems = partsData?.filter(part => 
        part.quantity <= (part.reorder_threshold || 5)
      ).length || 0;
      
      const interventionsCount = interventionsData?.length || 0;

      const newStatsData: StatsCardData[] = [
        {
          title: 'Active Equipment',
          value: equipmentCount || 'N/A',
          icon: Tractor,
          change: 0,
          description: ''
        },
        {
          title: 'Maintenance Tasks',
          value: tasksCount || 'N/A',
          icon: Wrench,
          description: highPriorityTasks > 0 ? `${highPriorityTasks} high priority` : '',
          change: 0
        },
        {
          title: 'Parts Inventory',
          value: totalPartsCount || 'N/A',
          icon: Package,
          description: lowStockItems > 0 ? `${lowStockItems} items low stock` : '',
          change: 0
        },
        {
          title: 'Field Interventions',
          value: interventionsCount || 'N/A',
          icon: MapPin,
          description: 'This week',
          change: 0
        }
      ];

      setStatsData(newStatsData);
    } catch (error) {
      console.error("Error fetching stats data:", error);
      setError("Failed to fetch dashboard statistics.");
      
      if (import.meta.env.DEV) {
        setDefaultStatsData();
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    statsData,
    error,
    refresh: fetchStatsData
  };
};

export default useStatsData;
