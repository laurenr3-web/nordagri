
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Button } from '../ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { useTimeBreakdown } from '@/hooks/time-tracking/useTimeBreakdown';

export function TimeBreakdownChart() {
  const { data, isLoading, error } = useTimeBreakdown();
  
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Time by Task Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px]">
          <div className="flex flex-col space-y-2 w-full h-full items-center justify-center">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Time by Task Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-red-500">Error loading data: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Time by Task Type</CardTitle>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center">
          <p className="text-gray-500">No completed sessions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Time by Task Type</CardTitle>
          <Button variant="link" size="sm">View more</Button>
        </div>
      </CardHeader>
      <CardContent className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <XAxis 
              dataKey="task_type" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              angle={0}
              textAnchor="middle"
              interval={0}
              height={40}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${Math.round(value / 60)} h`}
            />
            <Tooltip 
              formatter={(value) => {
                const hours = Math.floor(Number(value) / 60);
                const minutes = Math.round(Number(value) % 60);
                return [`${hours}h ${minutes}m`, 'Time Spent'];
              }}
              labelFormatter={(label) => `Task: ${label}`}
            />
            <Bar 
              dataKey="minutes" 
              radius={[4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
