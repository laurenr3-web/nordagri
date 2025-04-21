
import { useCallback } from 'react';
import { useTimeTrackingUser } from './useTimeTrackingUser';
import { useTimeTrackingStats } from './useTimeTrackingStats';
import { useTimeTrackingEquipment } from './useTimeTrackingEquipment';
import { useActiveTimeTrackingSessions } from './useActiveTimeTrackingSessions';
import { useTimeTrackingEntries } from './useTimeTrackingEntries';
import { useTimeTracking } from './useTimeTracking';
import { toast } from 'sonner';
import { useTimeTrackingContext } from '@/store/TimeTrackingContext';

export function useTimeTrackingData() {
  const {
    state: {
      activeTab,
      isFormOpen,
      dateRange,
      equipmentFilter,
      taskTypeFilter
    },
    setActiveTab,
    setIsFormOpen,
    setDateRange,
    setEquipmentFilter,
    setTaskTypeFilter,
    setEntries,
    resetFilters
  } = useTimeTrackingContext();

  const { userId } = useTimeTrackingUser();
  const { stats } = useTimeTrackingStats(userId);
  const { equipments } = useTimeTrackingEquipment();
  const { 
    activeTimeEntry, 
    startTimeEntry, 
    pauseTimeEntry 
  } = useTimeTracking();
  
  const { activeSessions } = useActiveTimeTrackingSessions(activeTimeEntry);
  const {
    entries,
    isLoading,
    handleResumeTimeEntry,
    handleDeleteTimeEntry,
    handleStopTimeEntry,
    fetchTimeEntries
  } = useTimeTrackingEntries(userId, dateRange, equipmentFilter, taskTypeFilter);

  // Mise à jour des entrées dans le contexte
  if (entries.length > 0) {
    setEntries(entries);
  }

  const handleStartTimeEntry = useCallback(async (data: any) => {
    if (!userId) return;
    
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
      toast.success("Time session started");
      // Rechargement des données après création
      fetchTimeEntries();
    } catch (error) {
      console.error("Error starting time tracking:", error);
      toast.error("Could not start session");
    }
  }, [userId, startTimeEntry, setIsFormOpen, fetchTimeEntries]);

  return {
    userId,
    entries,
    isLoading,
    activeTab,
    isFormOpen,
    stats,
    equipments,
    activeSessions,
    activeTimeEntry,
    dateRange,
    equipmentFilter,
    taskTypeFilter,
    handleStartTimeEntry,
    handleResumeTimeEntry,
    handleStopTimeEntry,
    handleDeleteTimeEntry,
    handlePauseTimeEntry: pauseTimeEntry,
    setIsFormOpen,
    setActiveTab,
    setDateRange,
    setEquipmentFilter,
    setTaskTypeFilter,
    resetFilters,
  };
}
