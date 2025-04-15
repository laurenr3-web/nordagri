
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ActiveTimeEntry } from './types';
import { formatDuration } from '@/utils/dateHelpers';

export function useTimeEntryState() {
  const [activeTimeEntry, setActiveTimeEntry] = useState<ActiveTimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  // Calculate initial duration based on start time
  const calculateInitialDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    return formatDuration(diffMs);
  };

  // Fetch user name from profiles table
  const fetchUserName = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setUserName(`${data.first_name || ''} ${data.last_name || ''}`.trim() || 'User');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  return {
    activeTimeEntry,
    setActiveTimeEntry,
    isLoading,
    setIsLoading,
    error,
    setError,
    calculateInitialDuration,
    userName,
    fetchUserName
  };
}
