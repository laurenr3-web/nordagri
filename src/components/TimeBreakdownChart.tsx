
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export interface TimeBreakdownData {
  task_type: string;
  minutes: number;
  color: string;
}

interface TimeBreakdownChartProps {
  data: TimeBreakdownData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TimeBreakdownChart({ data, isLoading = false, error = null }: TimeBreakdownChartProps) {
  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  
  // Calculer le pourcentage pour l'affichage des labels
  const chartData = data.map(item => ({
    ...item,
    percentage: ((item.minutes / totalMinutes) * 100).toFixed(0),
  }));

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Répartition du temps par type de tâche</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Chargement des données...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Répartition du temps par type de tâche</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80">
          <div className="text-center text-muted-foreground">
            <p>Une erreur est survenue lors du chargement des données.</p>
            <p className="text-sm mt-2">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Répartition du temps par type de tâche</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-80">
          <div className="text-center text-muted-foreground">
            <p>Aucune donnée disponible</p>
            <p className="text-sm mt-2">
              Complétez des sessions de travail pour voir leur répartition ici.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Répartition du temps par type de tâche</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="minutes"
                label={({ task_type, percentage }) => `${task_type} ${percentage}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip
                formatter={(value, name, props) => {
                  // Convert minutes to hours and minutes for display
                  const hours = Math.floor(value as number / 60);
                  const minutes = (value as number) % 60;
                  return [`${hours}h ${minutes}m`, props.payload.task_type];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
