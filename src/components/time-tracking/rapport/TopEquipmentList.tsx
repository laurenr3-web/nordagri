
import React from 'react';
import { TopEquipment } from '@/hooks/time-tracking/useTopEquipment';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface TopEquipmentListProps {
  data: TopEquipment[];
  isLoading: boolean;
}

export const TopEquipmentList: React.FC<TopEquipmentListProps> = ({ 
  data,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-4 text-center text-sm text-muted-foreground">
        Aucun équipement utilisé pendant cette période
      </div>
    );
  }

  // Find the maximum hours to calculate percentage for progress bars
  const maxHours = Math.max(...data.map(item => item.hours));

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">{item.name}</span>
            <span>{item.hours.toFixed(1)} h</span>
          </div>
          <Progress value={(item.hours / maxHours) * 100} className="h-2" />
        </div>
      ))}
    </div>
  );
};
