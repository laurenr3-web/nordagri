
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TimeEntry } from './types';

export function useActiveSessionMonitoring(activeTimeEntry: TimeEntry | null) {
  const [lastActivityCheck, setLastActivityCheck] = useState<Date | null>(null);
  const [warningSent, setWarningSent] = useState<boolean>(false);

  // Check if current time is within working hours (6h-20h)
  const isWorkingHours = () => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 6 && hours <= 20;
  };

  // Check for long session without pause
  useEffect(() => {
    if (!activeTimeEntry || activeTimeEntry.status !== 'active') {
      return;
    }

    const startTime = new Date(activeTimeEntry.start_time);
    const checkLongSession = () => {
      const now = new Date();
      const diffHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      // Alert if session is longer than 8 hours and warning hasn't been sent
      if (diffHours > 8 && !warningSent) {
        toast.warning('You have been working for over 8 hours', {
          description: 'Consider taking a break or ending your session.',
          duration: 10000,
          action: {
            label: "Dismiss",
            onClick: () => setWarningSent(true)
          }
        });
        setWarningSent(true);
      }
    };

    const intervalId = setInterval(checkLongSession, 60000); // Check every minute
    return () => clearInterval(intervalId);
  }, [activeTimeEntry, warningSent]);

  // Check for inactivity during working hours
  useEffect(() => {
    // If there's an active session, no need to remind
    if (activeTimeEntry) {
      setLastActivityCheck(new Date());
      return;
    }

    const checkInactivity = () => {
      // Skip check if outside working hours
      if (!isWorkingHours()) {
        return;
      }

      const now = new Date();
      
      // If no activity check yet, set it now
      if (!lastActivityCheck) {
        setLastActivityCheck(now);
        return;
      }
      
      const diffHours = (now.getTime() - lastActivityCheck.getTime()) / (1000 * 60 * 60);
      
      // Alert if inactive for more than 2 hours during working hours
      if (diffHours >= 2) {
        toast("No active time sessions", {
          description: "Would you like to start tracking your time?",
          action: {
            label: "Start Session",
            onClick: () => document.getElementById('start-time-session-btn')?.click()
          },
          onDismiss: () => setLastActivityCheck(new Date()) // Reset timer on dismiss
        });
      }
    };

    const intervalId = setInterval(checkInactivity, 5 * 60000); // Check every 5 minutes
    return () => clearInterval(intervalId);
  }, [activeTimeEntry, lastActivityCheck]);

  // Reset warning flag when session changes
  useEffect(() => {
    setWarningSent(false);
  }, [activeTimeEntry?.id]);

  return { isWorkingHours };
}
