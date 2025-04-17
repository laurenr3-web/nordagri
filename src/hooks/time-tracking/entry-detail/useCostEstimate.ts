
import { useState, useEffect } from 'react';
import { TimeEntry } from '@/hooks/time-tracking/types';

/**
 * Hook for calculating cost estimates based on time entry duration
 */
export function useCostEstimate(entry: TimeEntry | null) {
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    if (entry && entry.start_time) {
      const hourlyRate = 50;
      const start = new Date(entry.start_time);
      
      // For completed sessions, use the fixed end time
      const end = (entry.status === 'completed' && entry.end_time) 
        ? new Date(entry.end_time) 
        : new Date();
        
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      setEstimatedCost(Math.round(hours * hourlyRate * 100) / 100);
    }
  }, [entry]);

  return estimatedCost;
}
