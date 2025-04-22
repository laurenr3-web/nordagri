
import React, { memo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { EquipmentStats } from '@/hooks/time-tracking/useTimeStatistics';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend } from '@/components/ui/chart';

interface EquipmentUsageChartProps {
  data: EquipmentStats[];
  isLoading: boolean;
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

const EquipmentUsageChart: React.FC<EquipmentUsageChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-medium mb-4">Équipements les plus utilisés</h3>
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium mb-2">Équipements les plus utilisés</h3>
        <p className="text-muted-foreground">
          Aucune donnée disponible pour cette période
        </p>
      </div>
    );
  }

  // Format chart data
  const chartData = data.map(item => ({
    name: item.equipmentName || 'Sans équipement',
    value: parseFloat(item.hours.toFixed(1))
  }));

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Équipements les plus utilisés</h3>
      <div className="h-[300px]">
        <ChartContainer
          config={chartData.reduce((acc, item, index) => {
            acc[item.name] = {
              theme: {
                light: COLORS[index % COLORS.length],
                dark: COLORS[index % COLORS.length]
              }
            };
            return acc;
          }, {} as any)}
        >
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => 
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  nameKey="name"
                  formatter={(value) => [`${value}h`, 'Heures']}
                />
              }
            />
            <ChartLegend />
          </PieChart>
        </ChartContainer>
      </div>
    </div>
  );
};

export { EquipmentUsageChart };
export default memo(EquipmentUsageChart);
