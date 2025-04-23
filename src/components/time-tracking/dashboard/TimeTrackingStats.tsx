
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface TimeTrackingStatsProps {
  stats: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
  };
  isLoading?: boolean;
}

export function TimeTrackingStats({ stats, isLoading }: TimeTrackingStatsProps) {
  const formatHours = (hours: number) => {
    return `${hours.toFixed(1)} h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 w-full">
      {/* Time Today */}
      <Card className="w-full max-w-full">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Temps Aujourd'hui
          </h3>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatHours(stats.totalToday)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time This Week */}
      <Card className="w-full max-w-full">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Temps Cette Semaine
          </h3>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatHours(stats.totalWeek)
            )}
          </div>
        </CardContent>
      </Card>

      {/* Time This Month */}
      <Card className="w-full max-w-full">
        <CardContent className="pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Temps Ce Mois
          </h3>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              formatHours(stats.totalMonth)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
