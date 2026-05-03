import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFarmId } from '@/hooks/useFarmId';
import { usePoints } from '@/hooks/points/usePoints';
import { usePointsFilter } from '@/hooks/points/usePointsFilter';
import { Point, PointStatus, PointWithLastEvent } from '@/types/Point';
import { PointCard } from './PointCard';
import { NewPointDialog } from './NewPointDialog';
import { PointDetailDialog } from './PointDetailDialog';
import { PointsFilterBar } from './PointsFilterBar';
import { NoResultsState } from './NoResultsState';
import { STATUS_LABELS } from './pointHelpers';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/help/EmptyState';
import { emptyStates } from '@/content/help/emptyStates';

const GROUP_ORDER: PointStatus[] = ['open', 'watch', 'resolved'];

const GroupedView: React.FC<{
  points: PointWithLastEvent[];
  onSelect: (p: Point) => void;
}> = ({ points, onSelect }) => {
  const groups = GROUP_ORDER.map((status) => ({
    status,
    items: points.filter((p) => p.status === status),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) return null;

  return (
    <div className="space-y-4">
      {groups.map((g) => (
        <section key={g.status}>
          <h3 className="flex items-center gap-2 text-sm font-semibold mb-1.5">
            <span>{STATUS_LABELS[g.status]}</span>
            <span className="text-[11px] font-medium text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
              {g.items.length}
            </span>
          </h3>
          <div className="space-y-1.5">
            {g.items.map((p) => (
              <PointCard key={p.id} point={p} onClick={() => onSelect(p)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const FlatList: React.FC<{
  points: PointWithLastEvent[];
  onSelect: (p: Point) => void;
}> = ({ points, onSelect }) => (
  <div className="space-y-1.5">
    {points.map((p) => (
      <PointCard key={p.id} point={p} onClick={() => onSelect(p)} />
    ))}
  </div>
);

export const PointsPage = () => {
  const { farmId, isLoading: farmLoading } = useFarmId();
  const { data: points, isLoading } = usePoints(farmId);
  const [newOpen, setNewOpen] = useState(false);
  const [selected, setSelected] = useState<Point | null>(null);

  useEffect(() => {
    const handler = () => setNewOpen(true);
    window.addEventListener('points:n-point', handler);
    return () => window.removeEventListener('points:n-point', handler);
  }, []);

  const {
    filters,
    updateFilter,
    resetFilters,
    filteredPoints,
    counts,
    activeFiltersCount,
  } = usePointsFilter(points ?? []);

  const totalPoints = (points ?? []).length;

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
      ) : totalPoints === 0 ? (
        <EmptyState
          icon={emptyStates.surveillanceList.icon}
          title={emptyStates.surveillanceList.title}
          description={emptyStates.surveillanceList.description}
          action={{
            label: emptyStates.surveillanceList.actionLabel,
            onClick: () => setNewOpen(true),
          }}
          secondaryAction={
            emptyStates.surveillanceList.articleId
              ? {
                  label: emptyStates.surveillanceList.secondaryActionLabel!,
                  articleId: emptyStates.surveillanceList.articleId,
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-3 pb-24">
          {/* Status tabs — fixed 4-col grid (mobile constraint: no horizontal scroll) */}
          <Tabs
            value={filters.statusTab}
            onValueChange={(v) =>
              updateFilter('statusTab', v as PointStatus | 'all')
            }
          >
            <TabsList className="w-full grid grid-cols-4 h-auto p-1">
              <TabsTrigger value="all" className="text-[11px] sm:text-sm py-1.5">
                Tous ({counts.all})
              </TabsTrigger>
              <TabsTrigger value="open" className="text-[11px] sm:text-sm py-1.5">
                {STATUS_LABELS.open} ({counts.open})
              </TabsTrigger>
              <TabsTrigger value="watch" className="text-[11px] sm:text-sm py-1.5">
                {STATUS_LABELS.watch} ({counts.watch})
              </TabsTrigger>
              <TabsTrigger value="resolved" className="text-[11px] sm:text-sm py-1.5">
                {STATUS_LABELS.resolved} ({counts.resolved})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Filter bar */}
          <PointsFilterBar
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            activeFiltersCount={activeFiltersCount}
          />

          {/* Results */}
          {filteredPoints.length === 0 ? (
            <NoResultsState onReset={resetFilters} />
          ) : filters.statusTab === 'all' ? (
            <GroupedView points={filteredPoints} onSelect={setSelected} />
          ) : (
            <FlatList points={filteredPoints} onSelect={setSelected} />
          )}
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
