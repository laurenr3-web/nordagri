
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  LabelList 
} from 'recharts';
import { getTaskTypeColor } from '../utils/taskTypeUtils';

interface ChartData {
  type: string;
  hours: number;
  percentage: number;
}

interface DistributionBarChartProps {
  chartData: ChartData[];
  chartHeight: number;
  totalHours: number;
}

/**
 * The Bar Chart component for time distribution visualization
 */
export const DistributionBarChart: React.FC<DistributionBarChartProps> = ({ 
  chartData, 
  chartHeight, 
  totalHours 
}) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 8, right: 60, left: 20, bottom: 8 }}
      >
        <XAxis type="number" hide />
        <YAxis 
          type="category" 
          dataKey="type" 
          width={120}
          tick={{ 
            fontSize: 12,
            width: 100,
            overflow: "hidden"
          }}
          className="text-xs md:text-sm"
        />
        <RechartsTooltip 
          formatter={(value: number, name: string) => [
            `${value.toFixed(1)} heures (${(value / totalHours * 100).toFixed(1)}%)`,
            'Temps passé'
          ]}
          contentStyle={{ 
            backgroundColor: 'var(--background)', 
            borderColor: 'var(--border)',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '0.75rem'
          }}
        />
        <Bar dataKey="hours" radius={[4, 4, 4, 4]} barSize={30}>
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={getTaskTypeColor(entry.type)}
              className="hover:opacity-80 transition-opacity"
            />
          ))}
          <LabelList 
            dataKey="hours" 
            position="right" 
            formatter={(value: number) => `${value.toFixed(1)}h (${(value / totalHours * 100).toFixed(1)}%)`}
            style={{ 
              fontSize: '11px',
              fontWeight: 600,
              textAnchor: 'start',
              fill: 'var(--foreground)'
            }}
            offset={10}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
