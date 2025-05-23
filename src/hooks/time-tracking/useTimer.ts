
import { useState, useEffect } from 'react';
import { formatDuration } from '@/utils/dateHelpers';
import { TimeEntry } from './types';
import { useGlobalStore } from '@/store';
import { logger } from '@/utils/logger';

/**
 * Hook to manage timer display for an active time entry
 * 
 * Calculates and updates the elapsed duration for an active time entry,
 * handling pauses and resumptions.
 * 
 * @param {TimeEntry | null} activeTimeEntry - The active time entry to time
 * @returns {string} Formatted duration (HH:MM:SS)
 */
export function useTimer(activeTimeEntry: TimeEntry | null) {
  const [duration, setDuration] = useState<string>('00:00:00');
  const timeTracking = useGlobalStore(state => state.timeTracking);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Reset timer if there's no active entry
    if (!activeTimeEntry) {
      setDuration('00:00:00');
      return;
    }
    
    // Calculate duration based on entry status and pause data
    const calculateDuration = () => {
      const start = new Date(activeTimeEntry.start_time);
      const now = new Date();
      
      // Base duration is current time minus start time
      let totalMs = now.getTime() - start.getTime();
      
      // If the entry has pause data, subtract pause durations
      if (activeTimeEntry.pauses && Array.isArray(activeTimeEntry.pauses)) {
        activeTimeEntry.pauses.forEach(pause => {
          if (pause.start && pause.end) {
            // For completed pauses, subtract the pause duration
            const pauseStart = new Date(pause.start);
            const pauseEnd = new Date(pause.end);
            totalMs -= (pauseEnd.getTime() - pauseStart.getTime());
          } else if (pause.start && !pause.end && activeTimeEntry.status === 'paused') {
            // For ongoing pauses, subtract from current time
            const pauseStart = new Date(pause.start);
            totalMs -= (now.getTime() - pauseStart.getTime());
          }
        });
      }
      
      // If there's a stored duration (e.g. after resuming), use that as base
      if (activeTimeEntry.duration && activeTimeEntry.duration > 0) {
        // Convert hours to milliseconds
        const storedDurationMs = activeTimeEntry.duration * 60 * 60 * 1000;
        
        // If status is active, add time since last resume
        if (activeTimeEntry.status === 'active' && activeTimeEntry.last_resume) {
          const lastResume = new Date(activeTimeEntry.last_resume);
          totalMs = storedDurationMs + (now.getTime() - lastResume.getTime());
        } else {
          // Otherwise just use stored duration
          totalMs = storedDurationMs;
        }
      }
      
      return formatDuration(Math.max(0, totalMs));
    };
    
    // Initial calculation
    setDuration(calculateDuration());
    
    // Only set up interval for active entries
    if (activeTimeEntry.status === 'active' && timeTracking.isRunning) {
      intervalId = setInterval(() => {
        setDuration(calculateDuration());
      }, 1000);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeTimeEntry, timeTracking.isRunning]);

  return duration;
}
