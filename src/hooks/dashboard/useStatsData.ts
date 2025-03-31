
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Tractor, Wrench, Package, ClipboardCheck } from 'lucide-react';
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
        icon: ClipboardCheck,
        description: 'This week',
        change: 15
      }
    ]);
    setLoading(false);
  };

  const fetchStatsData = async () => {
    setLoading(true);
    try {
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
      
      // Calculate actual parts count - sum of all quantities
      const totalPartsQuantity = partsData?.reduce((sum, part) => 
        sum + (typeof part.quantity === 'number' ? part.quantity : 0), 0) || 0;
      
      const lowStockItems = partsData?.filter(part => 
        part.quantity <= (part.reorder_threshold || 5)
      ).length || 0;
      
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
          value: totalPartsQuantity,
          icon: Package,
          description: lowStockItems > 0 ? `${lowStockItems} items low stock` : '',
          change: 0
        },
        {
          title: 'Field Interventions',
          value: interventionsCount,
          icon: ClipboardCheck,
          description: 'This week',
          change: 0
        }
      ];

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
