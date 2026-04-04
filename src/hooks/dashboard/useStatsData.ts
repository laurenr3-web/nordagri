
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
  const { data: statsData = [], isLoading: loading } = useQuery({
    queryKey: ['dashboard', 'stats', user?.id],
    queryFn: async (): Promise<StatsCardData[]> => {
      const [equipmentRes, tasksRes, partsRes, interventionsRes] = await Promise.all([
        supabase.from('equipment').select('id'),
        supabase.from('maintenance_tasks').select('id, priority'),
        supabase.from('parts_inventory').select('id, quantity, reorder_threshold'),
        supabase.from('interventions').select('id').gte('date', new Date(Date.now() - 7 * 86400000).toISOString()),
      ]);

      if (equipmentRes.error || tasksRes.error || partsRes.error || interventionsRes.error) {
        throw new Error('Error fetching dashboard stats');
      }

      const highPriority = tasksRes.data?.filter(t => t.priority === 'high' || t.priority === 'critical').length || 0;
      const lowStock = partsRes.data?.filter(p => p.quantity <= (p.reorder_threshold || 5)).length || 0;

      return [
        { title: 'Active Equipment', value: equipmentRes.data?.length || 0, icon: Tractor, change: 0 },
        { title: 'Maintenance Tasks', value: tasksRes.data?.length || 0, icon: Wrench, change: 0, description: highPriority > 0 ? `${highPriority} high priority` : '' },
        { title: 'Parts Inventory', value: partsRes.data?.length || 0, icon: Package, change: 0, description: lowStock > 0 ? `${lowStock} items low stock` : '' },
        { title: 'Field Interventions', value: interventionsRes.data?.length || 0, icon: MapPin, change: 0, description: 'This week' },
      ];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { loading, statsData };
};
