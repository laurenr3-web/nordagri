
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";
import { Tractor, Wrench, Package, ClipboardCheck } from 'lucide-react';
import React from 'react';

export interface StatsCardData {
  title: string;
  value: number;
  icon: React.ReactNode;
  change: number;
}

export const useStatsData = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatsCardData[]>([]);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setMockData();
    }
  }, [user]);

  const setMockData = () => {
    setStatsData([
      {
        title: 'Active Equipment',
        value: 24,
        icon: React.createElement(Tractor, { className: "text-primary h-5 w-5" }),
        change: 4
      },
      {
        title: 'Maintenance Tasks',
        value: 12,
        icon: React.createElement(Wrench, { className: "text-primary h-5 w-5" }),
        change: -2
      },
      {
        title: 'Parts Inventory',
        value: 1204,
        icon: React.createElement(Package, { className: "text-primary h-5 w-5" }),
        change: 12
      },
      {
        title: 'Field Interventions',
        value: 8,
        icon: React.createElement(ClipboardCheck, { className: "text-primary h-5 w-5" }),
        change: 15
      }
    ]);
    setLoading(false);
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Count active equipment
      const { count: equipmentCount, error: equipmentError } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id)
        .eq('status', 'operational');

      if (equipmentError) throw equipmentError;

      // Count maintenance tasks
      const { count: tasksCount, error: tasksError } = await supabase
        .from('maintenance_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      if (tasksError) throw tasksError;

      // Count parts inventory
      const { count: partsCount, error: partsError } = await supabase
        .from('parts_inventory')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      if (partsError) throw partsError;

      // Count field interventions
      const { count: interventionsCount, error: interventionsError } = await supabase
        .from('interventions')
        .select('*', { count: 'exact', head: true })
        .eq('owner_id', user?.id);

      if (interventionsError) throw interventionsError;

      // Create stats data
      const newStatsData: StatsCardData[] = [
        {
          title: 'Active Equipment',
          value: equipmentCount || 0,
          icon: React.createElement(Tractor, { className: "text-primary h-5 w-5" }),
          change: 0 // We don't have change data yet
        },
        {
          title: 'Maintenance Tasks',
          value: tasksCount || 0,
          icon: React.createElement(Wrench, { className: "text-primary h-5 w-5" }),
          change: 0
        },
        {
          title: 'Parts Inventory',
          value: partsCount || 0,
          icon: React.createElement(Package, { className: "text-primary h-5 w-5" }),
          change: 0
        },
        {
          title: 'Field Interventions',
          value: interventionsCount || 0,
          icon: React.createElement(ClipboardCheck, { className: "text-primary h-5 w-5" }),
          change: 0
        }
      ];
      
      setStatsData(newStatsData);
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch stats data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    statsData,
    fetchStats
  };
};
