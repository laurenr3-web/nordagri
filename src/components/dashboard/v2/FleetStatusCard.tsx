import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tractor } from 'lucide-react';

interface Props {
  farmId: string | null;
}

export const FleetStatusCard: React.FC<Props> = ({ farmId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-v2', 'fleet', farmId],
    enabled: !!farmId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await supabase
        .from('equipment')
        .select('id, status')
        .eq('farm_id', farmId!);
      const list = data ?? [];
      const total = list.length;
      const operational = list.filter((e: any) => e.status === 'operational').length;
      const maintenance = list.filter((e: any) => e.status === 'maintenance').length;
      const repair = list.filter((e: any) => e.status === 'repair').length;
      return { total, operational, maintenance, repair };
    },
  });

  return (
    <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40 shadow-sm p-4 min-w-0">
      <div className="flex items-center gap-2 mb-3 min-w-0">
        <Tractor className="h-4 w-4 text-emerald-700 dark:text-emerald-300 shrink-0" />
        <h3 className="text-sm font-semibold text-emerald-900 dark:text-emerald-50 truncate">État de la flotte</h3>
      </div>
      {isLoading ? (
        <div className="h-16 bg-muted animate-pulse rounded-md" />
      ) : (
        <div className="grid grid-cols-3 gap-2 min-w-0">
          <div className="rounded-lg bg-emerald-500/15 p-2.5 text-center min-w-0">
            <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{data?.operational ?? 0}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight line-clamp-2">Actifs</div>
          </div>
          <div className="rounded-lg bg-amber-500/15 p-2.5 text-center min-w-0">
            <div className="text-xl font-bold text-amber-700 dark:text-amber-400">{data?.maintenance ?? 0}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight line-clamp-2">Maintenance</div>
          </div>
          <div className="rounded-lg bg-destructive/10 p-2.5 text-center min-w-0">
            <div className="text-xl font-bold text-destructive">{data?.repair ?? 0}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight line-clamp-2">Hors service</div>
          </div>
        </div>
      )}
    </div>
  );
};
