
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
  data?: TimeBreakdownData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function TimeBreakdownChart({ data, isLoading = false, error = null }: TimeBreakdownChartProps) {
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

  if (!data || !data.length) {
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

  const total = data.reduce((sum, item) => sum + item.minutes, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Répartition du temps par type de tâche</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="minutes"
                nameKey="task_type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => 
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `${(value / 60).toFixed(1)}h`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
