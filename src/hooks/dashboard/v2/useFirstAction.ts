import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { todayLocal } from '@/lib/dateLocal';

export type FirstActionPriority = 'critical' | 'important' | 'normal';

export interface FirstAction {
  id: string;
  source: 'maintenance' | 'point' | 'planning';
  sourceId: string | number;
  title: string;
  subtitle?: string | null;
  priority: FirstActionPriority;
  dueDate?: string | null;
  ctaLabel: string;
  ctaPath: string;
  equipmentId?: string | number | null;
}

export function useFirstAction(farmId: string | null) {
  const todayStr = todayLocal();

  const { data: maintenance } = useQuery({
    queryKey: ['dashboard-v2', 'firstAction', 'maintenance', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, priority, equipment_id, equipment, status, equipment_ref:equipment_id(farm_id)')
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
        .limit(20);
      return (data ?? []).filter((t: any) => t.equipment_ref?.farm_id === farmId);
    },
  });

  const { data: points } = useQuery({
    queryKey: ['dashboard-v2', 'firstAction', 'points', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('points')
        .select('id, title, entity_label, priority, status')
        .eq('farm_id', farmId!)
        .in('status', ['open', 'watch'])
        .eq('priority', 'critical')
        .order('last_event_at', { ascending: false })
        .limit(1);
      return data ?? [];
    },
  });

  const { data: planning } = useQuery({
    queryKey: ['dashboard-v2', 'firstAction', 'planning', farmId, todayStr],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('planning_tasks')
        .select('id, title, category, due_date, manual_priority, computed_priority, status')
        .eq('farm_id', farmId!)
        .neq('status', 'done')
        .order('due_date', { ascending: true })
        .limit(30);
      return data ?? [];
    },
  });

  return useMemo<FirstAction | null>(() => {
    const today = new Date(todayStr);
    today.setHours(0, 0, 0, 0);

    // 1) Maintenance overdue (due_date < today)
    const overdue = (maintenance ?? []).find((m: any) => {
      if (!m.due_date) return false;
      return new Date(m.due_date) < today;
    });
    if (overdue) {
      return {
        id: `maintenance-${overdue.id}`,
        source: 'maintenance',
        sourceId: overdue.id,
        title: overdue.title,
        subtitle: overdue.equipment ?? null,
        priority: 'critical',
        dueDate: overdue.due_date,
        ctaLabel: 'Traiter la maintenance',
        ctaPath: '/maintenance',
        equipmentId: overdue.equipment_id ?? null,
      };
    }

    // 2) Critical point
    const critPoint = (points ?? [])[0];
    if (critPoint) {
      return {
        id: `point-${critPoint.id}`,
        source: 'point',
        sourceId: critPoint.id,
        title: critPoint.title,
        subtitle: critPoint.entity_label,
        priority: 'critical',
        ctaLabel: 'Voir le point',
        ctaPath: '/points',
      };
    }

    // 3) Planning critical task today/overdue
    const planningCritical = (planning ?? []).find((t: any) => {
      const prio = t.manual_priority ?? t.computed_priority;
      return prio === 'critical' && t.due_date <= todayStr;
    });
    if (planningCritical) {
      return {
        id: `planning-${planningCritical.id}`,
        source: 'planning',
        sourceId: planningCritical.id,
        title: planningCritical.title,
        subtitle: planningCritical.category,
        priority: 'critical',
        dueDate: planningCritical.due_date,
        ctaLabel: 'Ouvrir la tâche',
        ctaPath: '/planning',
      };
    }

    // 4) Maintenance due today
    const dueToday = (maintenance ?? []).find((m: any) => {
      if (!m.due_date) return false;
      const d = new Date(m.due_date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
    if (dueToday) {
      return {
        id: `maintenance-${dueToday.id}`,
        source: 'maintenance',
        sourceId: dueToday.id,
        title: dueToday.title,
        subtitle: dueToday.equipment ?? null,
        priority: 'important',
        dueDate: dueToday.due_date,
        ctaLabel: 'Voir la maintenance',
        ctaPath: '/maintenance',
        equipmentId: dueToday.equipment_id ?? null,
      };
    }

    // 5) Important planning today
    const planningImportant = (planning ?? []).find((t: any) => {
      const prio = t.manual_priority ?? t.computed_priority;
      return prio === 'important' && t.due_date <= todayStr;
    });
    if (planningImportant) {
      return {
        id: `planning-${planningImportant.id}`,
        source: 'planning',
        sourceId: planningImportant.id,
        title: planningImportant.title,
        subtitle: planningImportant.category,
        priority: 'important',
        dueDate: planningImportant.due_date,
        ctaLabel: 'Ouvrir la tâche',
        ctaPath: '/planning',
      };
    }

    // 6) Any planning today
    const todayTask = (planning ?? []).find((t: any) => t.due_date <= todayStr);
    if (todayTask) {
      return {
        id: `planning-${todayTask.id}`,
        source: 'planning',
        sourceId: todayTask.id,
        title: todayTask.title,
        subtitle: todayTask.category,
        priority: 'normal',
        dueDate: todayTask.due_date,
        ctaLabel: 'Ouvrir la tâche',
        ctaPath: '/planning',
      };
    }

    return null;
  }, [maintenance, points, planning, todayStr]);
}
