import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Users, Activity, CheckCircle2 } from 'lucide-react';
import { formatHoursDecimalToHM } from '@/utils/timeFormat';

interface TimeTrackingSummaryProps {
  stats: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
  };
  isLoading: boolean;
  teamHoursToday?: number;
  activeCount?: number;
  completedCount?: number;
}

export function TimeTrackingSummary({
  stats,
  isLoading,
  teamHoursToday = 0,
  activeCount = 0,
  completedCount = 0,
}: TimeTrackingSummaryProps) {
  const tiles = [
    {
      label: 'Mon temps',
      value: formatHoursDecimalToHM(stats.totalToday),
      icon: Clock,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Temps équipe',
      value: formatHoursDecimalToHM(teamHoursToday),
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
    },
    {
      label: 'Sessions actives',
      value: String(activeCount),
      icon: Activity,
      color: 'text-amber-600',
      bg: 'bg-amber-500/10',
    },
    {
      label: 'Sessions terminées',
      value: String(completedCount),
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <Card className="rounded-2xl shadow-sm">
      <div className="p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-4">Résumé du jour</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {tiles.map((t) => {
            const Icon = t.icon;
            return (
              <div
                key={t.label}
                className="rounded-xl border bg-card p-3 sm:p-4 flex flex-col gap-2 min-w-0"
              >
                <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${t.bg} ${t.color} shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  {isLoading ? (
                    <Skeleton className="h-7 w-16" />
                  ) : (
                    <div className="text-2xl sm:text-3xl font-semibold tabular-nums tracking-tight">
                      {t.value}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5 truncate">{t.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
