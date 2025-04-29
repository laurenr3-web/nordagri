
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskTypeDistribution } from '@/hooks/time-tracking/useTaskTypeDistribution';
import { ColorLegendHelp } from './components/ColorLegendHelp';
import { DistributionBarChart } from './components/DistributionBarChart';
import { useDistributionChartData } from './hooks/useDistributionChartData';

interface TimeDistributionChartProps {
  data: TaskTypeDistribution[];
  isLoading: boolean;
}

export const TimeDistributionChart: React.FC<TimeDistributionChartProps> = ({ 
  data,
  isLoading
}) => {
  const { chartData, totalHours, chartHeight } = useDistributionChartData(data, isLoading);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Help button with color legend */}
      <div className="absolute right-0 -top-4 z-10">
        <ColorLegendHelp />
      </div>
      
      {/* Chart container with adaptive scrolling */}
      <div className="max-h-[60vh] md:max-h-[500px] overflow-y-auto pr-2 py-2">
        <div 
          className="w-full" 
          style={{ 
            height: chartHeight, 
            minHeight: '300px',
            minWidth: '100%'
          }}
        >
          <DistributionBarChart 
            chartData={chartData}
            chartHeight={chartHeight}
            totalHours={totalHours}
          />
        </div>
      </div>
    </div>
  );
};
