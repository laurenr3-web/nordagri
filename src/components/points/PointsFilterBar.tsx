import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PRIORITY_LABELS,
  TYPE_LABELS,
} from './pointHelpers';
import type {
  PointsFilterState,
  CheckFilter,
} from '@/hooks/points/usePointsFilter';
import type { PointPriority, PointType } from '@/types/Point';

interface Props {
  filters: PointsFilterState;
  updateFilter: <K extends keyof PointsFilterState>(
    key: K,
    value: PointsFilterState[K]
  ) => void;
  resetFilters: () => void;
  activeFiltersCount: number;
}

const CHECK_LABELS: Record<CheckFilter, string> = {
  all: 'Toutes les dates',
  today: "Aujourd'hui",
  this_week: 'Cette semaine',
  overdue: 'En retard',
};

const truncate = (s: string, max = 30) =>
  s.length > max ? `${s.slice(0, max - 1)}…` : s;

export const PointsFilterBar: React.FC<Props> = ({
  filters,
  updateFilter,
  resetFilters,
  activeFiltersCount,
}) => {
  const hasActive = activeFiltersCount > 0;

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="relative">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          aria-hidden
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Rechercher un point..."
          aria-label="Rechercher dans les points à surveiller"
          className="pl-9"
        />
      </div>

      {/* Selects + reset */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Select
          value={filters.type}
          onValueChange={(v) => updateFilter('type', v as PointType | 'all')}
        >
          <SelectTrigger className="h-9 text-xs sm:w-[160px]" aria-label="Filtrer par type">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {(Object.keys(TYPE_LABELS) as PointType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(v) =>
            updateFilter('priority', v as PointPriority | 'all')
          }
        >
          <SelectTrigger
            className="h-9 text-xs sm:w-[160px]"
            aria-label="Filtrer par priorité"
          >
            <SelectValue placeholder="Priorité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes priorités</SelectItem>
            {(Object.keys(PRIORITY_LABELS) as PointPriority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.checkFilter}
          onValueChange={(v) => updateFilter('checkFilter', v as CheckFilter)}
        >
          <SelectTrigger
            className="h-9 text-xs sm:w-[180px]"
            aria-label="Filtrer par échéance"
          >
            <SelectValue placeholder="À vérifier" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(CHECK_LABELS) as CheckFilter[]).map((c) => (
              <SelectItem key={c} value={c}>
                {CHECK_LABELS[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActive && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="col-span-2 h-9 text-xs sm:col-span-1"
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Réinitialiser ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActive && (
        <div className="flex flex-wrap gap-1.5">
          {filters.search.trim() && (
            <ActiveBadge
              label={`Recherche : "${truncate(filters.search.trim())}"`}
              onRemove={() => updateFilter('search', '')}
              ariaLabel="Retirer le filtre recherche"
            />
          )}
          {filters.type !== 'all' && (
            <ActiveBadge
              label={`Type : ${TYPE_LABELS[filters.type]}`}
              onRemove={() => updateFilter('type', 'all')}
              ariaLabel="Retirer le filtre type"
            />
          )}
          {filters.priority !== 'all' && (
            <ActiveBadge
              label={`Priorité : ${PRIORITY_LABELS[filters.priority]}`}
              onRemove={() => updateFilter('priority', 'all')}
              ariaLabel="Retirer le filtre priorité"
            />
          )}
          {filters.checkFilter !== 'all' && (
            <ActiveBadge
              label={`Échéance : ${CHECK_LABELS[filters.checkFilter]}`}
              onRemove={() => updateFilter('checkFilter', 'all')}
              ariaLabel="Retirer le filtre échéance"
            />
          )}
        </div>
      )}
    </div>
  );
};

const ActiveBadge: React.FC<{
  label: string;
  onRemove: () => void;
  ariaLabel: string;
}> = ({ label, onRemove, ariaLabel }) => (
  <Badge variant="secondary" className="gap-1 pl-2 pr-1 py-0.5 text-[11px] font-medium">
    <span>{label}</span>
    <button
      type="button"
      onClick={onRemove}
      aria-label={ariaLabel}
      className="ml-0.5 hover:bg-secondary-foreground/15 rounded-sm p-0.5"
    >
      <X className="h-3 w-3" />
    </button>
  </Badge>
);