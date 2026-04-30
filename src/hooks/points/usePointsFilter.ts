import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  PointPriority,
  PointStatus,
  PointType,
  PointWithLastEvent,
} from '@/types/Point';

export type CheckFilter = 'all' | 'today' | 'this_week' | 'overdue';

export interface PointsFilterState {
  search: string;
  statusTab: PointStatus | 'all';
  type: PointType | 'all';
  priority: PointPriority | 'all';
  checkFilter: CheckFilter;
}

export const DEFAULT_FILTERS: PointsFilterState = {
  search: '',
  statusTab: 'all',
  type: 'all',
  priority: 'all',
  checkFilter: 'all',
};

const STORAGE_KEY = 'nordagri_points_filters_v1';

const VALID_STATUS_TABS: ReadonlyArray<PointStatus | 'all'> = [
  'all',
  'open',
  'watch',
  'resolved',
];
const VALID_TYPES: ReadonlyArray<PointType | 'all'> = [
  'all',
  'animal',
  'equipement',
  'champ',
  'batiment',
  'autre',
];
const VALID_PRIORITIES: ReadonlyArray<PointPriority | 'all'> = [
  'all',
  'critical',
  'important',
  'normal',
];
const VALID_CHECK_FILTERS: ReadonlyArray<CheckFilter> = [
  'all',
  'today',
  'this_week',
  'overdue',
];

const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function sanitize(raw: unknown): PointsFilterState {
  if (!raw || typeof raw !== 'object') return DEFAULT_FILTERS;
  const r = raw as Record<string, unknown>;
  const search = typeof r.search === 'string' ? r.search : DEFAULT_FILTERS.search;
  const statusTab = VALID_STATUS_TABS.includes(r.statusTab as PointStatus | 'all')
    ? (r.statusTab as PointStatus | 'all')
    : DEFAULT_FILTERS.statusTab;
  const type = VALID_TYPES.includes(r.type as PointType | 'all')
    ? (r.type as PointType | 'all')
    : DEFAULT_FILTERS.type;
  const priority = VALID_PRIORITIES.includes(r.priority as PointPriority | 'all')
    ? (r.priority as PointPriority | 'all')
    : DEFAULT_FILTERS.priority;
  const checkFilter = VALID_CHECK_FILTERS.includes(r.checkFilter as CheckFilter)
    ? (r.checkFilter as CheckFilter)
    : DEFAULT_FILTERS.checkFilter;
  return { search, statusTab, type, priority, checkFilter };
}

export function usePointsFilter(points: PointWithLastEvent[]) {
  // useState initializer reads sessionStorage synchronously → no flicker on first paint.
  const [filters, setFilters] = useState<PointsFilterState>(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) return DEFAULT_FILTERS;
      return sanitize(JSON.parse(saved));
    } catch {
      return DEFAULT_FILTERS;
    }
  });

  // Persist on change (silent on failure: storage may be unavailable).
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch {
      /* silent */
    }
  }, [filters]);

  const updateFilter = useCallback(
    <K extends keyof PointsFilterState>(key: K, value: PointsFilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  // UX decision: reset preserves the active statusTab — the tab is the main
  // navigation element, not a "filter". Reset only clears secondary filters.
  const resetFilters = useCallback(() => {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, statusTab: prev.statusTab }));
  }, []);

  const filteredPoints = useMemo(() => {
    const q = normalize(filters.search.trim());
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);
    const weekEnd = new Date(todayStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    return points.filter((p) => {
      if (filters.statusTab !== 'all' && p.status !== filters.statusTab) return false;
      if (filters.type !== 'all' && p.type !== filters.type) return false;
      if (filters.priority !== 'all' && p.priority !== filters.priority) return false;

      if (filters.checkFilter !== 'all') {
        if (!p.next_check_at) return false;
        const next = new Date(p.next_check_at);
        if (filters.checkFilter === 'today' && (next < todayStart || next > todayEnd))
          return false;
        if (filters.checkFilter === 'this_week' && (next < todayStart || next > weekEnd))
          return false;
        if (filters.checkFilter === 'overdue' && next >= todayStart) return false;
      }

      if (q) {
        const haystack = normalize(
          [p.title, p.entity_label ?? '', p.last_event_note ?? ''].join(' ')
        );
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [points, filters]);

  // UX decision: counts reflect type + priority + search, but NOT checkFilter
  // nor statusTab. Including checkFilter would make tab numbers swing wildly
  // when toggling a temporal filter, which is confusing for "global" headers.
  const counts = useMemo(() => {
    const q = normalize(filters.search.trim());
    const base = points.filter((p) => {
      if (filters.type !== 'all' && p.type !== filters.type) return false;
      if (filters.priority !== 'all' && p.priority !== filters.priority) return false;
      if (q) {
        const haystack = normalize(
          [p.title, p.entity_label ?? '', p.last_event_note ?? ''].join(' ')
        );
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return {
      all: base.length,
      open: base.filter((p) => p.status === 'open').length,
      watch: base.filter((p) => p.status === 'watch').length,
      resolved: base.filter((p) => p.status === 'resolved').length,
    };
  }, [points, filters.type, filters.priority, filters.search]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search.trim()) count += 1;
    if (filters.type !== 'all') count += 1;
    if (filters.priority !== 'all') count += 1;
    if (filters.checkFilter !== 'all') count += 1;
    return count;
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredPoints,
    counts,
    activeFiltersCount,
  };
}