
import React, { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { EmployeeStats } from '@/hooks/time-tracking/useTimeStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface EmployeeWorkHoursChartProps {
  data: EmployeeStats[];
  isLoading: boolean;
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];

const EmployeeWorkHoursChart: React.FC<EmployeeWorkHoursChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Top employés par heures travaillées</h3>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium mb-2">Top employés par heures travaillées</h3>
        <p className="text-muted-foreground">
          Aucune donnée disponible pour cette période
        </p>
      </div>
    );
  }

  // Format chart data for optimal display
  const chartData = data.map(item => ({
    ...item,
    hours: parseFloat(item.hours.toFixed(1))
  }));

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Top employés par heures travaillées</h3>
      <div className="h-[300px]">
        <ChartContainer 
          config={{
            bar: { 
              theme: {
                light: COLORS[0],
                dark: COLORS[0]
              }
            }
          }}
        >
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="employeeName" tick={{ fontSize: 12 }} />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={(value) => `${value}h`} 
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Employé: ${value}`}
                  formatter={(value: number) => [`${value}h`, 'Heures']}
                />
              }
            />
            <Bar dataKey="hours" fill={COLORS[0]} radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export { EmployeeWorkHoursChart };
export default memo(EmployeeWorkHoursChart);
