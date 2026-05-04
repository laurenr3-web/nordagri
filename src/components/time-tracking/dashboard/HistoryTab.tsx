import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History } from 'lucide-react';
import { TimeTrackingFilters } from './TimeTrackingFilters';
import { TimeEntryCard } from '../TimeEntryCard';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { startOfWeek, endOfWeek } from 'date-fns';

interface HistoryTabProps {
  entries: TimeEntry[];
  isLoading: boolean;
  equipments: { id: number; name: string }[];
  dateRange: { from: Date; to: Date };
  setDateRange: (r: { from: Date; to: Date }) => void;
  equipmentFilter?: number;
  setEquipmentFilter: (v: number | undefined) => void;
  taskTypeFilter?: string;
  setTaskTypeFilter: (v: string | undefined) => void;
}

export function HistoryTab({
  entries,
  isLoading,
  equipments,
  dateRange,
  setDateRange,
  equipmentFilter,
  setEquipmentFilter,
  taskTypeFilter,
  setTaskTypeFilter,
}: HistoryTabProps) {
  const reset = () => {
    setDateRange({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    });
    setEquipmentFilter(undefined);
    setTaskTypeFilter(undefined);
  };

  const sorted = [...entries].sort(
    (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
  );

  return (
    <div className="space-y-4 min-w-0">
      <TimeTrackingFilters
        dateRange={dateRange}
        equipmentFilter={equipmentFilter}
        taskTypeFilter={taskTypeFilter}
        equipments={equipments}
        onDateRangeChange={setDateRange}
        onEquipmentChange={setEquipmentFilter}
        onTaskTypeChange={setTaskTypeFilter}
        onReset={reset}
      />
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="rounded-2xl border-dashed">
          <div className="p-8 flex flex-col items-center text-center gap-2">
            <div className="rounded-full bg-muted p-3">
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              Aucune session pour cette période
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((entry) => (
            <TimeEntryCard
              key={entry.id}
              entry={entry}
              onResume={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}