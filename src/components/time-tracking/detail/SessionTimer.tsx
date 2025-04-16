
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { formatDuration } from '@/utils/dateHelpers';

interface SessionTimerProps {
  startTime: Date;
  endTime?: Date | null;
  status: 'active' | 'paused' | 'completed';
}

export const SessionTimer = ({ startTime, endTime, status }: SessionTimerProps) => {
  const [currentDuration, setCurrentDuration] = useState('00:00:00');
  const [progressValue, setProgressValue] = useState(0);
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Initial calculation
    const now = new Date();
    
    // For completed sessions, use the fixed duration between start and end time
    if (status === 'completed' && endTime) {
      const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
      setCurrentDuration(formatDuration(diffMs));
      
      // Calculate progress (8 hours workday)
      const progressPercent = Math.min((diffMs / (8 * 60 * 60 * 1000)) * 100, 100);
      setProgressValue(progressPercent);
      
      // No need for interval for completed sessions
      return;
    }
    
    // For active or paused sessions, calculate current duration
    const diffMs = now.getTime() - new Date(startTime).getTime();
    setCurrentDuration(formatDuration(diffMs));
    
    // Calculate progress (8 hours workday)
    const progressPercent = Math.min((diffMs / (8 * 60 * 60 * 1000)) * 100, 100);
    setProgressValue(progressPercent);
    
    // Only update time for active sessions
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
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [startTime, endTime, status]);

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
