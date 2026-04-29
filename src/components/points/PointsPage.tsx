import { useMemo, useState } from 'react';
import { Plus, ChevronDown, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFarmId } from '@/hooks/useFarmId';
import { usePoints } from '@/hooks/points/usePoints';
import { Point, PointStatus, PointWithLastEvent } from '@/types/Point';
import { PointCard } from './PointCard';
import { NewPointDialog } from './NewPointDialog';
import { PointDetailDialog } from './PointDetailDialog';
import { STATUS_LABELS } from './pointHelpers';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const ORDER: PointStatus[] = ['open', 'watch', 'resolved'];

export const PointsPage = () => {
  const { farmId, isLoading: farmLoading } = useFarmId();
  const { data: points, isLoading } = usePoints(farmId);
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<Point | null>(null);
  const [collapsed, setCollapsed] = useState<Record<PointStatus, boolean>>({
    open: false,
    watch: false,
    resolved: true,
  });

  const grouped = useMemo(() => {
    const map: Record<PointStatus, PointWithLastEvent[]> = { open: [], watch: [], resolved: [] };
    (points ?? []).forEach((p) => map[p.status]?.push(p));
    return map;
  }, [points]);

  const toggle = (s: PointStatus) => setCollapsed((c) => ({ ...c, [s]: !c[s] }));

  return (
    <LayoutWrapper>
      <PageHeader
        title="Points à surveiller"
        description="Suivez les problèmes du terrain dans le temps."
        action={
          farmId && (
            <Button onClick={() => setNewOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Ajouter un point
            </Button>
          )
        }
      />

      {farmLoading || isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : !farmId ? (
        <p className="text-sm text-muted-foreground">Aucune ferme accessible.</p>
      ) : (
        <div className="space-y-5 pb-24">
          {ORDER.map((status) => {
            const list = grouped[status];
            const isCollapsed = collapsed[status];
            return (
              <section key={status}>
                <button
                  type="button"
                  onClick={() => toggle(status)}
                  className="w-full flex items-center gap-2 mb-2 text-sm font-semibold"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="text-muted-foreground font-normal">({list.length})</span>
                </button>
                {!isCollapsed && (
                  <div className={cn('space-y-2', list.length === 0 && 'pl-6')}>
                    {list.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Aucun point.</p>
                    ) : (
                      list.map((p) => (
                        <PointCard key={p.id} point={p} onClick={() => setSelected(p)} />
                      ))
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Mobile FAB */}
      {farmId && (
        <Button
          onClick={() => setNewOpen(true)}
          className="lg:hidden fixed bottom-20 right-4 rounded-full h-14 px-5 shadow-xl z-40"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-1" /> Point
        </Button>
      )}

      {farmId && <NewPointDialog open={newOpen} onOpenChange={setNewOpen} farmId={farmId} />}
      <PointDetailDialog
        point={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </LayoutWrapper>
  );
};