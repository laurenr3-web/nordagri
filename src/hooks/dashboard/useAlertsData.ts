
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AlertItem {
  id: string | number;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  equipmentId: number;
  equipmentName: string;
  status: 'new' | 'acknowledged' | 'resolved';
  type: string;
  time: string;
  equipment: string;
}

export const useAlertsData = (user: any) => {
  const { data: alertItems = [], isLoading: loading } = useQuery({
    queryKey: ['dashboard', 'alerts', user?.id],
    queryFn: async (): Promise<AlertItem[]> => {
      const [maintenanceRes, partsRes] = await Promise.all([
        supabase.from('maintenance_tasks').select('*').eq('status', 'pending').order('due_date', { ascending: true }).limit(10),
        supabase.from('parts_inventory').select('*').order('quantity', { ascending: true }).limit(15),
      ]);

      if (maintenanceRes.error) throw maintenanceRes.error;
      if (partsRes.error) throw partsRes.error;

      const alerts: AlertItem[] = [];
      const now = new Date();

      (maintenanceRes.data || []).forEach(task => {
        const dueDate = new Date(task.due_date);
        const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / 86400000);
        let severity: 'high' | 'medium' | 'low' = daysDiff <= 2 || task.priority === 'high' || task.priority === 'critical' ? 'high' : daysDiff <= 7 ? 'medium' : 'low';

        alerts.push({
          id: task.id,
          title: 'Maintenance planifiée',
          message: `${task.title} pour ${task.equipment}`,
          severity,
          date: dueDate,
          equipmentId: task.equipment_id || 0,
          equipmentName: task.equipment,
          status: 'new',
          type: 'maintenance',
          time: dueDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          equipment: task.equipment,
        });
      });

      const lowStockParts = (partsRes.data || []).filter(p => p.quantity <= (p.reorder_threshold || 5)).slice(0, 5);
      lowStockParts.forEach(part => {
        const ratio = part.quantity / (part.reorder_threshold || 1);
        const severity: 'high' | 'medium' | 'low' = ratio <= 0.3 ? 'high' : ratio <= 0.7 ? 'medium' : 'low';

        alerts.push({
          id: `part-${part.id}`,
          title: 'Stock faible',
          message: `${part.name} en stock faible (${part.quantity}/${part.reorder_threshold})`,
          severity,
          date: now,
          equipmentId: 0,
          equipmentName: '',
          status: 'new',
          type: 'inventory',
          time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          equipment: 'N/A',
        });
      });

      alerts.sort((a, b) => {
        if (a.severity !== b.severity) {
          const order = { high: 0, medium: 1, low: 2 };
          return order[a.severity] - order[b.severity];
        }
        return b.date.getTime() - a.date.getTime();
      });

      return alerts;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return { loading, alertItems };
};

export default useAlertsData;
