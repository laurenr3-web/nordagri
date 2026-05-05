import { useQuery } from '@tanstack/react-query';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { supabase } from '@/integrations/supabase/client';
import { useFarmId } from '@/hooks/useFarmId';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

export interface EquipmentSnapshot {
  tasks: any[];
  points: any[];
  overdueTasks: any[];
  upcomingTasks: any[];
  completedTasks: any[];
  activePoints: any[];
  criticalPoints: any[];
  importantPoints: any[];
  lastActivity: string | null;
}

const empty: EquipmentSnapshot = {
  tasks: [], points: [],
  overdueTasks: [], upcomingTasks: [], completedTasks: [],
  activePoints: [], criticalPoints: [], importantPoints: [],
  lastActivity: null,
};

export function useEquipmentSnapshot(equipment: EquipmentItem) {
  const { farmId } = useFarmId();
  const eqId = Number(equipment.id);
  const eqIdStr = String(equipment.id);
  const eqName = equipment.name;
  const cv = equipment.valeur_actuelle ?? 0;

  return useQuery<EquipmentSnapshot>({
    queryKey: ['equipment-snapshot', farmId, eqId, cv],
    enabled: !!eqId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [tasksRes, pointsByIdRes] = await Promise.all([
        maintenanceService.getTasksForEquipment(eqId).catch(() => []),
        farmId
          ? supabase.from('points').select('*')
              .eq('farm_id', farmId).eq('type', 'equipement')
              .eq('entity_id', eqIdStr).order('last_event_at', { ascending: false })
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const tasks: any[] = Array.isArray(tasksRes) ? tasksRes : [];
      let points: any[] = (pointsByIdRes as any)?.data ?? [];

      if (points.length === 0 && farmId && eqName) {
        const fb = await supabase.from('points').select('*')
          .eq('farm_id', farmId).eq('type', 'equipement')
          .ilike('entity_label', `%${eqName}%`)
          .order('last_event_at', { ascending: false });
        points = fb.data ?? [];
      }

      const isOverdue = (x: any) => {
        if (x.status === 'completed' || x.status === 'cancelled') return false;
        const th = x.triggerHours ?? x.trigger_hours;
        const tk = x.triggerKilometers ?? x.trigger_kilometers;
        if (x.trigger_unit === 'hours' && th != null) return cv >= th;
        if (x.trigger_unit === 'kilometers' && tk != null) return cv >= tk;
        return x.dueDate ? new Date(x.dueDate) < new Date() : false;
      };

      const overdueTasks = tasks.filter(isOverdue);
      const upcomingTasks = tasks
        .filter((x) => x.status !== 'completed' && x.status !== 'cancelled' && !isOverdue(x))
        .sort((a, b) => new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime());
      const completedTasks = tasks
        .filter((x) => x.status === 'completed')
        .sort((a, b) => new Date(b.completedDate || b.dueDate || 0).getTime() - new Date(a.completedDate || a.dueDate || 0).getTime());

      const activePoints = points.filter((p) => p.status !== 'resolved');
      const criticalPoints = activePoints.filter((p) => p.priority === 'critical');
      const importantPoints = activePoints.filter((p) => p.priority === 'important');

      const wear = typeof equipment.last_wear_update === 'string'
        ? equipment.last_wear_update
        : (equipment.last_wear_update as Date | null)?.toISOString?.() ?? null;
      const lastCompleted = completedTasks[0]?.completedDate || completedTasks[0]?.dueDate || null;
      const candidates = [wear, lastCompleted].filter(Boolean) as string[];
      const lastActivity = candidates.length
        ? candidates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
        : null;

      return {
        tasks, points,
        overdueTasks, upcomingTasks, completedTasks,
        activePoints, criticalPoints, importantPoints,
        lastActivity,
      };
    },
  }).data ?? empty;
}

export const equipmentSnapshotKey = (farmId: string | null | undefined, eqId: number, cv: number) =>
  ['equipment-snapshot', farmId, eqId, cv];