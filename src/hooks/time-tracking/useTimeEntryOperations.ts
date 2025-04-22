import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { TimeEntry } from '@/types/TimeEntry';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';

export const useTimeEntryOperations = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch entries
  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      // Just passing one argument instead of two
      const data = await timeTrackingService.getTimeEntries({});
      if (data) {
        setEntries(data);
      }
    } catch (error) {
      console.error("Error fetching time entries:", error);
      setError("Failed to load time entries");
    } finally {
      setIsLoading(false);
    }
  };

  // Add entry
  const addEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    setIsLoading(true);
    try {
      const newEntry = await timeTrackingService.addTimeEntry(entry);
      if (newEntry) {
        setEntries(prevEntries => [...prevEntries, newEntry]);
        toast.success("Time entry added successfully");
      } else {
        toast.error("Failed to add time entry");
      }
    } catch (error) {
      console.error("Error adding time entry:", error);
      toast.error("Failed to add time entry");
    } finally {
      setIsLoading(false);
    }
  };

  // Update entry
  const updateEntry = async (id: string, updates: Partial<TimeEntry>) => {
    setIsLoading(true);
    try {
      const updatedEntry = await timeTrackingService.updateTimeEntry(id, updates);
      if (updatedEntry) {
        setEntries(prevEntries =>
          prevEntries.map(entry => (entry.id === id ? { ...entry, ...updatedEntry } : entry))
        );
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

  // Delete entry
  const deleteEntry = async (id: string) => {
    setIsLoading(true);
    try {
      await timeTrackingService.deleteTimeEntry(id);
      setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
      toast.success("Time entry deleted successfully");
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Failed to delete time entry");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  return {
    entries,
    isLoading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries
  };
};
