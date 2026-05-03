import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AlertOctagon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  farmId: string | null;
}

interface Blocker {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  ctaPath: string;
}

export const BlockersCard: React.FC<Props> = ({ farmId }) => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-v2', 'blockers', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async (): Promise<Blocker[]> => {
      const blockers: Blocker[] = [];

      // Low stock parts
      const { data: parts } = await supabase
        .from('parts_inventory')
        .select('id, name, quantity, reorder_threshold')
        .eq('farm_id', farmId!);
      const low = (parts ?? []).filter(
        (p: any) => (p.quantity ?? 0) <= (p.reorder_threshold ?? 5)
      );
      low.slice(0, 1).forEach((p: any) => {
        blockers.push({
          id: `part-${p.id}`,
          title: `${p.name} manquant`,
          subtitle: 'Stock à recommander',
          cta: 'Commander',
          ctaPath: '/parts',
        });
      });

      // Unassigned critical/important planning tasks
      const { data: tasks } = await supabase
        .from('planning_tasks')
        .select('id, title, manual_priority, computed_priority')
        .eq('farm_id', farmId!)
        .is('assigned_to', null)
        .neq('status', 'done')
        .limit(5);
      const urgent = (tasks ?? []).find((t: any) => {
        const p = t.manual_priority ?? t.computed_priority;
        return p === 'critical' || p === 'important';
      });
      if (urgent) {
        blockers.push({
          id: `task-${urgent.id}`,
          title: 'Tâche non assignée urgente',
          subtitle: urgent.title,
          cta: 'Assigner',
          ctaPath: '/planning',
        });
      }

      return blockers;
    },
  });

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <AlertOctagon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Blocages</h3>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="p-6 text-sm text-center text-muted-foreground">Aucun blocage.</p>
      ) : (
        <ul className="divide-y">
          {data.map((b) => (
            <li key={b.id} className="flex items-center gap-3 px-4 py-3 min-w-0">
              <div className="h-7 w-7 rounded-full bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                <AlertOctagon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{b.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{b.subtitle}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(b.ctaPath)}
                className="h-7 px-3 text-xs flex-shrink-0"
              >
                {b.cta}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
