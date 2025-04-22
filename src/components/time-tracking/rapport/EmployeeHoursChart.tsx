
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { EmployeeHoursData } from '@/hooks/time-tracking/useEmployeeHours';

interface EmployeeHoursChartProps {
  data: EmployeeHoursData[];
  isLoading: boolean;
  error: Error | null;
}

export function EmployeeHoursChart({ data, isLoading, error }: EmployeeHoursChartProps) {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Heures par employé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center">
            <Skeleton className="h-[250px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Heures par employé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-destructive">
            Erreur lors du chargement des données
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.length) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Heures par employé</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible pour cette période
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Heures par employé</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                height={60}
                tickMargin={10}
                angle={-15}
              />
              <YAxis 
                label={{ value: 'Heures', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                formatter={(value) => [`${value} heures`, 'Temps total']}
                labelFormatter={(label) => `Employé: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="hours" 
                name="Heures travaillées" 
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
                barSize={40}
              >
                {data.map((entry, index) => (
                  <Bar key={`bar-${index}`} dataKey="hours" fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
