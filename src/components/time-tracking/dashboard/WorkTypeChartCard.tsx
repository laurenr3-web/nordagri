import React from 'react';
import { TimeBreakdownChart } from '@/components/time-tracking/TimeBreakdownChart';
import { useTimeBreakdown } from '@/hooks/time-tracking/useTimeBreakdown';

export function WorkTypeChartCard() {
  const { data, isLoading, error } = useTimeBreakdown();
  return (
    <div className="w-full h-full min-w-0 [&>*]:w-full [&>*]:h-full">
      <TimeBreakdownChart data={data} isLoading={isLoading} error={error} />
    </div>
  );
}