
import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/dateHelpers';
import { TimeEntry } from './types';

export function useTimer(activeTimeEntry: TimeEntry | null) {
  const [duration, setDuration] = useState<string>('00:00:00');

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    if (activeTimeEntry && activeTimeEntry.status === 'active') {
      intervalId = setInterval(() => {
        const start = new Date(activeTimeEntry.start_time);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        setDuration(formatDuration(diffMs));
      }, 1000);
      
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));
    } else if (activeTimeEntry && activeTimeEntry.status === 'paused') {
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
