import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Activity as ActivityIcon, CheckCircle2, Eye, Clock, Wrench, Package } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
  farmId: string | null;
}

interface ActivityItem {
  id: string;
  type: 'maintenance' | 'observation' | 'time' | 'part' | 'intervention';
  text: string;
  at: string;
}

const iconFor = (t: ActivityItem['type']) => {
  switch (t) {
    case 'maintenance': return CheckCircle2;
    case 'observation': return Eye;
    case 'time': return Clock;
    case 'part': return Package;
    case 'intervention': return Wrench;
  }
};

export const RecentActivityCard: React.FC<Props> = ({ farmId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-v2', 'recent-activity', farmId],
    enabled: !!farmId,
    staleTime: 60_000,
    queryFn: async (): Promise<ActivityItem[]> => {
      const items: ActivityItem[] = [];

      const [{ data: maint }, { data: points }] = await Promise.all([
        supabase
          .from('maintenance_tasks')
          .select('id, title, status, completed_date, equipment_ref:equipment_id(name, farm_id)')
          .eq('status', 'completed')
          .order('completed_date', { ascending: false, nullsFirst: false })
          .limit(8),
        supabase
          .from('points')
          .select('id, title, last_event_at, entity_label')
          .eq('farm_id', farmId!)
          .order('last_event_at', { ascending: false })
          .limit(3),
      ]);

      (maint ?? [])
        .filter((m: any) => m.equipment_ref?.farm_id === farmId)
        .slice(0, 3)
        .forEach((m: any) => {
          items.push({
            id: `m-${m.id}`,
            type: 'maintenance',
            text: `${m.title} terminée${m.equipment_ref?.name ? ` · ${m.equipment_ref.name}` : ''}`,
            at: m.completed_date ?? new Date().toISOString(),
          });
        });

      (points ?? []).forEach((p: any) => {
        items.push({
          id: `p-${p.id}`,
          type: 'observation',
          text: `${p.title}${p.entity_label ? ` · ${p.entity_label}` : ''}`,
          at: p.last_event_at,
        });
      });

      return items
        .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
        .slice(0, 5);
    },
  });

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Activité récente</h3>
        </div>
      </div>
      {isLoading ? (
        <div className="p-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="p-6 text-sm text-center text-muted-foreground">Pas d'activité récente.</p>
      ) : (
        <ul className="divide-y">
          {data.map((a) => {
            const Icon = iconFor(a.type);
            return (
              <li key={a.id} className="flex items-center gap-3 px-4 py-2.5 min-w-0">
                <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm flex-1 truncate">{a.text}</p>
                <span className="text-[11px] text-muted-foreground flex-shrink-0">
                  il y a {formatDistanceToNowStrict(new Date(a.at), { locale: fr })}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
