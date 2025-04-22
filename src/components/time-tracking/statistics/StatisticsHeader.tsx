
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimeRange } from '@/hooks/time-tracking/useTimeStatistics';

interface StatisticsHeaderProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

export const StatisticsHeader: React.FC<StatisticsHeaderProps> = ({
  timeRange,
  onTimeRangeChange
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Statistiques de temps</h1>
        <p className="text-muted-foreground mt-1">
          Analysez la répartition du temps de travail et l'utilisation des équipements
        </p>
      </div>
      
      <div className="mt-4 md:mt-0">
        <Select 
          value={timeRange} 
          onValueChange={(value) => onTimeRangeChange(value as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Cette semaine</SelectItem>
            <SelectItem value="month">Ce mois</SelectItem>
            <SelectItem value="quarter">Ce trimestre</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
