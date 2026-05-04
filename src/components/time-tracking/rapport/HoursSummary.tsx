
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type SummaryType = {
  today: number;
  week: number;
  month: number;
  todayPercentage: number;
  weekPercentage: number;
  monthPercentage: number;
};

type HoursSummaryProps = {
  summary?: SummaryType;
};

const HoursSummary: React.FC<HoursSummaryProps> = ({ summary }) => (
  <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full">
    <Card className="rounded-2xl">
      <CardContent className="p-3 sm:p-4">
        <p className="text-[11px] sm:text-xs text-muted-foreground">Aujourd&apos;hui</p>
        <h3 className="text-lg sm:text-2xl font-bold tabular-nums">
          {summary?.today.toFixed(1) ?? '0.0'} h
        </h3>
        <Progress value={summary?.todayPercentage || 0} className="h-1 mt-2" />
      </CardContent>
    </Card>
    <Card className="rounded-2xl">
      <CardContent className="p-3 sm:p-4">
        <p className="text-[11px] sm:text-xs text-muted-foreground">Cette semaine</p>
        <h3 className="text-lg sm:text-2xl font-bold tabular-nums">
          {summary?.week.toFixed(1) ?? '0.0'} h
        </h3>
        <Progress value={summary?.weekPercentage || 0} className="h-1 mt-2" />
      </CardContent>
    </Card>
    <Card className="rounded-2xl">
      <CardContent className="p-3 sm:p-4">
        <p className="text-[11px] sm:text-xs text-muted-foreground">Ce mois</p>
        <h3 className="text-lg sm:text-2xl font-bold tabular-nums">
          {summary?.month.toFixed(1) ?? '0.0'} h
        </h3>
        <Progress value={summary?.monthPercentage || 0} className="h-1 mt-2" />
      </CardContent>
    </Card>
  </div>
);

export default HoursSummary;
