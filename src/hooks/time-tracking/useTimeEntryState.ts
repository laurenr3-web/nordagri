
import { useState } from 'react';
import { ActiveTimeEntry } from './types';
import { formatDuration } from '@/utils/dateHelpers';

export function useTimeEntryState() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const calculateInitialDuration = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    return formatDuration(diffMs);
  };

  return {
    activeTimeEntry,
    setActiveTimeEntry,
    isLoading,
    setIsLoading,
    error,
    setError,
    calculateInitialDuration
  };
}
