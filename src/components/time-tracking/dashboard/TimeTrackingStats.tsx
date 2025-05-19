
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-6 w-full">
      {/* Time Today */}
      <Card className="w-full max-w-full">
        <CardContent className="pt-4 sm:pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center sm:text-left">
            Temps Aujourd'hui
          </h3>
          <div className="text-2xl font-bold min-h-[44px] flex items-center justify-center">
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
        <CardContent className="pt-4 sm:pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center sm:text-left">
            Temps Cette Semaine
          </h3>
          <div className="text-2xl font-bold min-h-[44px] flex items-center justify-center">
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
        <CardContent className="pt-4 sm:pt-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2 text-center sm:text-left">
            Temps Ce Mois
          </h3>
          <div className="text-2xl font-bold min-h-[44px] flex items-center justify-center">
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
