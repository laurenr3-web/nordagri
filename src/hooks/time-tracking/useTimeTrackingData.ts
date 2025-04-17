
import { useState } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { useTimeTrackingUser } from './useTimeTrackingUser';
import { useTimeTrackingStats } from './useTimeTrackingStats';
import { useTimeTrackingEquipment } from './useTimeTrackingEquipment';
import { useActiveTimeTrackingSessions } from './useActiveTimeTrackingSessions';
import { useTimeTrackingEntries } from './useTimeTrackingEntries';
import { useTimeTracking } from './useTimeTracking';
import { usePayrollPeriod } from './usePayrollPeriod';
import { toast } from 'sonner';

export function useTimeTrackingData() {
  const [activeTab, setActiveTab] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  const [equipmentFilter, setEquipmentFilter] = useState<number | undefined>(undefined);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | undefined>(undefined);
  const [payrollPeriodType, setPayrollPeriodType] = useState<string>('weekly');

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
    handleStopTimeEntry
  } = useTimeTrackingEntries(userId, dateRange, equipmentFilter, taskTypeFilter);

  const { totalHours: payrollHours, isLoading: payrollLoading, error: payrollError } = usePayrollPeriod(
    userId,
    dateRange.from,
    dateRange.to,
    payrollPeriodType
  );

  const handleStartTimeEntry = async (data: any) => {
    if (!userId) return;
    
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
      toast.success("Time session started");
    } catch (error) {
      console.error("Error starting time tracking:", error);
      toast.error("Could not start session");
    }
  };

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
    payrollHours,
    payrollLoading,
    payrollError,
    payrollPeriodType,
    setPayrollPeriodType,
  };
}
