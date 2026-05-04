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

const INACTIVE_STATUSES = new Set([
  'done', 'completed', 'resolved', 'cancelled', 'canceled', 'archived',
  'terminé', 'termine', 'annulé', 'annule',
]);

const isInactive = (s: any) => INACTIVE_STATUSES.has(String(s ?? '').toLowerCase());

export function useFirstAction(farmId: string | null) {
  const todayStr = todayLocal();

  const { data: maintenance } = useQuery({
    queryKey: ['dashboard-v2', 'firstAction', 'maintenance', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('maintenance_tasks')
        .select('id, title, due_date, priority, equipment_id, equipment, status, updated_at, created_at, equipment_ref:equipment_id(farm_id)')
        .neq('status', 'completed')
        .order('due_date', { ascending: true })
        .limit(20);
      return (data ?? []).filter((t: any) => t.equipment_ref?.farm_id === farmId && !isInactive(t.status));
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
        .select('id, title, category, due_date, manual_priority, computed_priority, status, created_at, updated_at')
        .eq('farm_id', farmId!)
        .neq('status', 'done')
        .limit(100);
      return (data ?? []).filter((t: any) => !isInactive(t.status));
    },
  });

  return useMemo<FirstAction | null>(() => {
    const today = new Date(todayStr);
    today.setHours(0, 0, 0, 0);

    type Candidate = {
      score: number;
      dateKey: string;
      updatedKey: string;
      action: FirstAction;
    };

    const candidates: Candidate[] = [];

    const getPlanningPrio = (t: any): string | null => {
      // manual override > explicit priority field > computed
      return t.manual_priority ?? (t as any).priority ?? t.computed_priority ?? null;
    };

    // Planning tasks
    for (const t of planning ?? []) {
      const prio = getPlanningPrio(t);
      const status = String(t.status ?? '').toLowerCase();
      const blocked = status === 'blocked' || status === 'bloqué' || status === 'bloque';
      const inProgress = status === 'in_progress' || status === 'en cours';
      const dueStr = t.due_date as string | null;
      const isOverdue = !!dueStr && dueStr < todayStr;
      const isToday = dueStr === todayStr;

      let score = 0;
      let mapped: FirstActionPriority = 'normal';

      if (prio === 'critical') {
        // Tâche critique non terminée (rule 1) — highest. Blocked critical even higher (rule 2).
        score = blocked ? 110 : 100;
        mapped = 'critical';
      } else if (blocked && prio === 'important') {
        score = 95; // bloquée critique/importante (rule 2)
        mapped = 'important';
      } else if (prio === 'important') {
        score = 50; // rule 6
        mapped = 'important';
      } else if (inProgress) {
        score = 40; // rule 7
        mapped = 'normal';
      } else if (isToday) {
        score = 25; // rule 9
        mapped = 'normal';
      } else if (isOverdue) {
        score = 22;
        mapped = 'normal';
      } else {
        score = 5; // rule 10 — autre tâche non terminée
        mapped = 'normal';
      }

      // Slight boost for overdue items within same priority bucket
      if (isOverdue && prio !== 'critical') score += 1;

      candidates.push({
        score,
        dateKey: dueStr ?? '9999-99-99',
        updatedKey: String(t.updated_at ?? t.created_at ?? ''),
        action: {
          id: `planning-${t.id}`,
          source: 'planning',
          sourceId: t.id,
          title: t.title,
          subtitle: t.category,
          priority: mapped,
          dueDate: dueStr,
          ctaLabel: 'Ouvrir la tâche',
          ctaPath: '/planning',
        },
      });
    }

    // Maintenance overdue / due today (rules 3 & 8)
    for (const m of maintenance ?? []) {
      if (!m.due_date) continue;
      const d = new Date(m.due_date);
      if (isNaN(d.getTime())) continue;
      d.setHours(0, 0, 0, 0);
      const overdue = d.getTime() < today.getTime();
      const dueToday = d.getTime() === today.getTime();
      if (!overdue && !dueToday) continue;

      const score = overdue ? 90 : 30; // rule 3 (overdue maintenance), rule 8 (due today)
      candidates.push({
        score,
        dateKey: String(m.due_date).slice(0, 10),
        updatedKey: String(m.updated_at ?? m.created_at ?? ''),
        action: {
          id: `maintenance-${m.id}`,
          source: 'maintenance',
          sourceId: m.id,
          title: m.title,
          subtitle: m.equipment ?? null,
          priority: overdue ? 'critical' : 'important',
          dueDate: m.due_date,
          ctaLabel: overdue ? 'Traiter la maintenance' : 'Voir la maintenance',
          ctaPath: '/maintenance',
          equipmentId: m.equipment_id ?? null,
        },
      });
    }

    // Critical point (rule 4)
    for (const p of points ?? []) {
      candidates.push({
        score: 80,
        dateKey: todayStr,
        updatedKey: '',
        action: {
          id: `point-${p.id}`,
          source: 'point',
          sourceId: p.id,
          title: p.title,
          subtitle: p.entity_label,
          priority: 'critical',
          ctaLabel: 'Voir le point',
          ctaPath: '/points',
        },
      });
    }

    if (candidates.length === 0) return null;

    candidates.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      // most recently updated wins as tiebreaker
      return b.updatedKey.localeCompare(a.updatedKey);
    });

    return candidates[0].action;
  }, [maintenance, points, planning, todayStr]);
}
