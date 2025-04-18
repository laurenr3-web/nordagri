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

  useEffect(() => {
    fetchStatsData();
  }, [user]);

  const setMockData = () => {
    setStatsData([
      {
        title: 'Équipements actifs',
        value: '24',
        icon: Tractor,
        change: 4,
        description: ''
      }, {
        title: 'Tâches de maintenance',
        value: '12',
        icon: Wrench,
        description: '3 haute priorité',
        change: -2
      }, {
        title: 'Inventaire de pièces',
        value: '1,204',
        icon: Package,
        description: '8 articles en stock faible',
        change: 12
      }, {
        title: 'Interventions sur le terrain',
        value: '8',
        icon: MapPin,
        description: 'Interventions actives',
        change: 15
      }
    ]);
    setLoading(false);
  };

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
          title: 'Équipements actifs',
          value: equipmentCount,
          icon: Tractor,
          change: 0,
          description: ''
        },
        {
          title: 'Tâches de maintenance',
          value: tasksCount,
          icon: Wrench,
          description: highPriorityTasks > 0 ? `${highPriorityTasks} haute priorité` : '',
          change: 0
        },
        {
          title: 'Inventaire de pièces',
          value: totalPartsCount, // FIXED: Now showing count of unique parts instead of sum of quantities
          icon: Package,
          description: lowStockItems > 0 ? `${lowStockItems} articles en stock faible` : '',
          change: 0
        },
        {
          title: 'Interventions sur le terrain',
          value: interventionsCount,
          icon: MapPin,
          description: 'Interventions actives',
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
