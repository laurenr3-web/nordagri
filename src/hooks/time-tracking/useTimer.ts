
import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/dateHelpers';

export function useTimeTrackingTimer(activeTimeEntry: any | null) {
  const [duration, setDuration] = useState<string>('00:00:00');
  
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      // Start interval to update timer
      intervalId = setInterval(() => {
        const start = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        setDuration(formatDuration(diffMs));
      }, 1000);
      
      // Calculate initial duration
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    } else if (activeTimeEntry && activeTimeEntry.status === 'paused') {
      // For paused entry, just show elapsed time without updates
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimeEntry]);

  return duration;
}
