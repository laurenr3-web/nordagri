import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TimeEntry } from '@/types/TimeEntry';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { useSearchParams } from 'react-router-dom';

export const useTimeEntryDetail = () => {
  const [searchParams] = useSearchParams();
  const entryId = searchParams.get('id');
  const [entry, setEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  // Fetch time entry detail by ID
  useEffect(() => {
    const fetchEntryData = async () => {
      if (!entryId) return;
      
      setIsLoading(true);
      try {
        const data = await timeTrackingService.getTimeEntryById(entryId);
        
        if (data) {
          setEntry(data);
          // Just passing one argument instead of two
          const entries = await timeTrackingService.getTimeEntries({});
          
          if (entries) {
            setEntries(entries);
          }
        }
      } catch (error) {
        console.error("Error fetching time entry:", error);
        setError("Failed to load time entry");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntryData();
  }, [entryId]);

  // Update time entry
  const updateEntry = async (updates: Partial<TimeEntry>) => {
    if (!entryId) return;

    setIsLoading(true);
    try {
      const updatedEntry = await timeTrackingService.updateTimeEntry(entryId, updates);
      if (updatedEntry) {
        setEntry(updatedEntry);
        toast.success("Time entry updated successfully");
      } else {
        toast.error("Failed to update time entry");
      }
    } catch (error) {
      console.error("Error updating time entry:", error);
      toast.error("Failed to update time entry");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete time entry
  const deleteEntry = async () => {
    if (!entryId) return;

    setIsLoading(true);
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success("Time entry deleted successfully");
      // Optionally, redirect to time tracking list or update state
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entry,
    entries,
    isLoading,
    error,
    updateEntry,
    deleteEntry,
  };
};
