
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
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
    <Card className="bg-blue-50 w-full max-w-full">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">Aujourd&apos;hui</p>
        <h3 className="text-xl font-bold">{summary?.today.toFixed(1)} h</h3>
        <Progress value={summary?.todayPercentage || 0} className="h-1 mt-1" />
      </CardContent>
    </Card>
    <Card className="bg-green-50 w-full max-w-full">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">Cette semaine</p>
        <h3 className="text-xl font-bold">{summary?.week.toFixed(1)} h</h3>
        <Progress value={summary?.weekPercentage || 0} className="h-1 mt-1" />
      </CardContent>
    </Card>
    <Card className="bg-purple-50 w-full max-w-full">
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground">Ce mois</p>
        <h3 className="text-xl font-bold">{summary?.month.toFixed(1)} h</h3>
        <Progress value={summary?.monthPercentage || 0} className="h-1 mt-1" />
      </CardContent>
    </Card>
  </div>
);

export default HoursSummary;
