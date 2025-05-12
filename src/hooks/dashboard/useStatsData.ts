
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Tractor, Wrench, Package, MapPin } from 'lucide-react';
import React from 'react';

/**
 * Interface pour les données de cartes statistiques
 */
export interface StatsCardData {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  change: number;
  description?: string;
}

/**
 * Hook pour récupérer les statistiques globales pour le tableau de bord
 * 
 * Obtient des statistiques sur les équipements, tâches de maintenance,
 * inventaire des pièces et interventions sur le terrain.
 * 
 * @param {any} user - L'utilisateur connecté
 * @returns {Object} Données statistiques et état de chargement
 */
export const useStatsData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsCardData[]>([]);

  useEffect(() => {
    fetchStatsData();
  }, [user]);

  /**
   * Définit des données de test en cas d'échec de récupération
   */
  const setMockData = () => {
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
    setLoading(false);
  };

  /**
   * Récupère les statistiques depuis la base de données
   */
  const fetchStatsData = async () => {
    setLoading(true);
    try {
      console.log("Fetching dashboard stats data...");
      
      // Get equipment count
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id');

      // Get maintenance tasks count
      const { data: tasksData, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('id, priority');

      // Get parts inventory count and total sum
      const { data: partsData, error: partsError } = await supabase
        .from('parts_inventory')
        .select('id, quantity, reorder_threshold');

      console.log("Parts data received:", partsData);
      
      // Get interventions count (for this week)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: interventionsData, error: interventionsError } = await supabase
        .from('interventions')
        .select('id')
        .gte('date', oneWeekAgo.toISOString());

      // Handle errors
      if (equipmentError || tasksError || partsError || interventionsError) {
        console.error("Data fetch errors:", { equipmentError, tasksError, partsError, interventionsError });
        throw new Error("Error fetching dashboard stats");
      }

      // Prepare stats data
      const equipmentCount = equipmentData?.length || 0;
      const tasksCount = tasksData?.length || 0;
      const highPriorityTasks = tasksData?.filter(task => 
        task.priority === 'high' || task.priority === 'critical'
      ).length || 0;
      
      // FIX: Correctly calculate total parts quantity
      // Instead of summing all part quantities, we should count the total number of parts
      const totalPartsCount = partsData?.length || 0;
      
      // Log individual part quantities for debugging
      if (partsData && partsData.length > 0) {
        console.log("Individual part quantities:");
        partsData.forEach(part => {
          console.log(`Part ${part.id}: quantity = ${part.quantity}, threshold = ${part.reorder_threshold}`);
        });
      }
      
      // Calculate low stock items correctly
      const lowStockItems = partsData?.filter(part => 
        part.quantity <= (part.reorder_threshold || 5)
      ).length || 0;
      
      console.log(`Total parts count: ${totalPartsCount}, Low stock items: ${lowStockItems}`);
      
      const interventionsCount = interventionsData?.length || 0;

      const newStatsData: StatsCardData[] = [
        {
          title: 'Active Equipment',
          value: equipmentCount,
          icon: Tractor,
          change: 0,
          description: ''
        },
        {
          title: 'Maintenance Tasks',
          value: tasksCount,
          icon: Wrench,
          description: highPriorityTasks > 0 ? `${highPriorityTasks} high priority` : '',
          change: 0
        },
        {
          title: 'Parts Inventory',
          value: totalPartsCount, // FIXED: Now showing count of unique parts instead of sum of quantities
          icon: Package,
          description: lowStockItems > 0 ? `${lowStockItems} items low stock` : '',
          change: 0
        },
        {
          title: 'Field Interventions',
          value: interventionsCount,
          icon: MapPin,
          description: 'This week',
          change: 0
        }
      ];

      console.log("New stats data:", newStatsData);
      setStatsData(newStatsData);
    } catch (error) {
      console.error("Error fetching stats data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics. Using default values.",
        variant: "destructive",
      });
      setMockData();
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    statsData
  };
};
