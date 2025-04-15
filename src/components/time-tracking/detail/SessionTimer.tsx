
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { formatDuration } from '@/utils/dateHelpers';

interface SessionTimerProps {
  startTime: Date;
  status: 'active' | 'paused' | 'completed';
}

export const SessionTimer = ({ startTime, status }: SessionTimerProps) => {
  const [currentDuration, setCurrentDuration] = useState('00:00:00');
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (status === 'active') {
      intervalId = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - new Date(startTime).getTime();
        setCurrentDuration(formatDuration(diffMs));
        
        // Calculate progress (8 hours workday)
        const progressPercent = Math.min((diffMs / (8 * 60 * 60 * 1000)) * 100, 100);
        setProgressValue(progressPercent);
      }, 1000);
    }
    
    return () => clearInterval(intervalId);
  }, [startTime, status]);

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-3xl font-bold tracking-tight">{currentDuration}</h3>
        <span className="text-sm text-muted-foreground">
          Début: {new Date(startTime).toLocaleTimeString()}
        </span>
      </div>
      <Progress value={progressValue} className="h-2" />
    </div>
  );
};
