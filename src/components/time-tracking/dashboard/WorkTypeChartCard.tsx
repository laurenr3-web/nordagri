import React from 'react';
import { TimeBreakdownChart } from '@/components/time-tracking/TimeBreakdownChart';
import { useTimeBreakdown } from '@/hooks/time-tracking/useTimeBreakdown';
import { startOfWeek, endOfWeek } from 'date-fns';

export function WorkTypeChartCard() {
  const range = {
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  };
  const { data, isLoading, error } = useTimeBreakdown(range);
  return <TimeBreakdownChart data={data} isLoading={isLoading} error={error as Error | null} />;
}