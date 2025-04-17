
import { useState } from 'react';
import { TimeEntry } from './types';

export function useActiveTimeTrackingSessions(activeTimeEntry: TimeEntry | null) {
  const [activeSessions, setActiveSessions] = useState<TimeEntry[]>([]);

  const fetchActiveSessions = async () => {
    try {
      const mockSessions = [];
      
      if (activeTimeEntry) {
        mockSessions.push({
          ...activeTimeEntry,
          user_name: 'Christophe'
        });
      }
      
      setActiveSessions(mockSessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
    }
  };

  return { activeSessions, fetchActiveSessions };
}
