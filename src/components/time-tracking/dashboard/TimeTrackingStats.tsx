
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeTrackingStatsProps {
  stats: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
  };
  isLoading: boolean;
}

export function TimeTrackingStats({ stats, isLoading }: TimeTrackingStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Time Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : `${stats.totalToday.toFixed(1)} h`}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Time This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : `${stats.totalWeek.toFixed(1)} h`}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Time This Month</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? <Skeleton className="h-8 w-20" /> : `${stats.totalMonth.toFixed(1)} h`}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
