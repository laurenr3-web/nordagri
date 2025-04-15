
import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/dateHelpers';

export function useTimer(startTime: string | null, isActive: boolean) {
  const [duration, setDuration] = useState<string>('00:00:00');

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (startTime && isActive) {
      // Initial calculation
      const start = new Date(startTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      setDuration(formatDuration(diffMs));

      // Set up interval for updates
      intervalId = setInterval(() => {
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        setDuration(formatDuration(diffMs));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startTime, isActive]);

  return duration;
}
