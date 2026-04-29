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

const ORDER: PointStatus[] = ['open', 'watch', 'resolved'];

const EMPTY_MESSAGES: Record<PointStatus, string> = {
  open: 'Aucun point en cours 👍\nTout est sous contrôle.',
  watch: 'Rien à surveiller pour le moment.',
  resolved: 'Aucun point réglé pour l’instant.',
};

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
      />

      {farmLoading || isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : !farmId ? (
        <p className="text-sm text-muted-foreground">Aucune ferme accessible.</p>
      ) : (
        <div className="space-y-3 pb-24">
          {ORDER.map((status) => {
            const list = grouped[status];
            const isCollapsed = collapsed[status];
            return (
              <section key={status}>
                <button
                  type="button"
                  onClick={() => toggle(status)}
                  className="w-full flex items-center gap-2 mb-1.5 text-sm font-semibold hover:text-primary transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRightIcon className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                  <span>{STATUS_LABELS[status]}</span>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
                    {list.length}
                  </span>
                </button>
                {!isCollapsed && (
                  <div className="space-y-1.5">
                    {list.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic whitespace-pre-line py-2 pl-6">
                        {EMPTY_MESSAGES[status]}
                      </p>
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

      {/* Floating Action Button — primary entry point for adding a point */}
      {farmId && (
        <Button
          onClick={() => setNewOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 rounded-full h-14 px-5 shadow-xl z-40"
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