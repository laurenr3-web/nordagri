
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

export function TimeTrackingSummary({ stats, isLoading }: TimeTrackingStatsProps) {
  // Format hours with a maximum of 2 decimal places, and ensure it doesn't display unreasonable values
  const formatHours = (hours: number): string => {
    // Safety check for ridiculous values
    const safeHours = isNaN(hours) ? 0 : Math.min(hours, 744); // 31 days * 24 hours max
    return `${safeHours.toFixed(2)} h`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 w-full">
      <Card className="rounded-xl sm:rounded-lg w-full max-w-full bg-blue-50">
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-sm sm:text-base font-medium text-center sm:text-left">Temps Aujourd'hui</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-2xl font-bold min-h-[44px] flex items-center justify-center sm:justify-start">
            {isLoading ? <Skeleton className="h-8 w-20" /> : formatHours(stats.totalToday)}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl sm:rounded-lg w-full max-w-full bg-green-50">
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-sm sm:text-base font-medium text-center sm:text-left">Temps Cette Semaine</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-2xl font-bold min-h-[44px] flex items-center justify-center sm:justify-start">
            {isLoading ? <Skeleton className="h-8 w-20" /> : formatHours(stats.totalWeek)}
          </div>
        </CardContent>
      </Card>
      <Card className="rounded-xl sm:rounded-lg w-full max-w-full bg-purple-50">
        <CardHeader className="pb-1 sm:pb-2">
          <CardTitle className="text-sm sm:text-base font-medium text-center sm:text-left">Temps Ce Mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl sm:text-2xl font-bold min-h-[44px] flex items-center justify-center sm:justify-start">
            {isLoading ? <Skeleton className="h-8 w-20" /> : formatHours(stats.totalMonth)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
