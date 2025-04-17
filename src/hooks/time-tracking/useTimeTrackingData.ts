import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { useTimeTracking } from './useTimeTracking';
import { useActiveSessionMonitoring } from './useActiveSessionMonitoring';
import { TimeEntry } from './types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useTimeTrackingData() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const { 
    activeTimeEntry, 
    isLoading: isActiveSessionLoading, 
    startTimeEntry, 
    stopTimeEntry, 
    pauseTimeEntry, 
    resumeTimeEntry 
  } = useTimeTracking();
  
  useActiveSessionMonitoring(activeTimeEntry);
  
  const [dateRange, setDateRange] = useState({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  const [equipmentFilter, setEquipmentFilter] = useState<number | undefined>(undefined);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | undefined>(undefined);
  
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0
  });
  
  const [equipments, setEquipments] = useState<{ id: number; name: string }[]>([]);
  const [activeSessions, setActiveSessions] = useState<TimeEntry[]>([]);
  
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  useEffect(() => {
    if (userId) {
      fetchTimeEntries();
      fetchEquipments();
      calculateStats();
      fetchActiveSessions();
    }
  }, [userId, dateRange, equipmentFilter, taskTypeFilter]);
  
  const fetchTimeEntries = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    try {
      const data = await timeTrackingService.getTimeEntries({
        userId,
        startDate: dateRange.from,
        endDate: dateRange.to,
        equipmentId: equipmentFilter,
        taskType: taskTypeFilter as any
      });
      
      setEntries(data);
    } catch (error) {
      console.error("Error fetching time entries:", error);
      toast.error("Could not load time sessions");
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  const fetchEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
    }
  };
  
  const calculateStats = async () => {
    if (!userId) return;
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: today,
        endDate: tomorrow
      });
      
      const weekEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: dateRange.from,
        endDate: dateRange.to
      });
      
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);
      
      const lastDayOfMonth = new Date(firstDayOfMonth.getFullYear(), firstDayOfMonth.getMonth() + 1, 0);
      lastDayOfMonth.setHours(23, 59, 59, 999);
      
      const monthEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: firstDayOfMonth,
        endDate: lastDayOfMonth
      });
      
      setStats({
        totalToday: calculateTotalHours(todayEntries),
        totalWeek: calculateTotalHours(weekEntries),
        totalMonth: calculateTotalHours(monthEntries)
      });
    } catch (error) {
      console.error("Error calculating statistics:", error);
    }
  };
  
  const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : new Date();
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  const handleStartTimeEntry = async (data: any) => {
    if (!userId) return;
    
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
      toast.success("Time session started");
      fetchTimeEntries();
      fetchActiveSessions();
    } catch (error) {
      console.error("Error starting time tracking:", error);
      toast.error("Could not start session");
    }
  };
  
  const handleResumeTimeEntry = async (entryId: string) => {
    try {
      await resumeTimeEntry(entryId);
      toast.success("Session resumed");
      fetchTimeEntries();
      fetchActiveSessions();
    } catch (error) {
      console.error("Error resuming time tracking:", error);
      toast.error("Could not resume session");
    }
  };
  
  const handlePauseTimeEntry = async (entryId: string) => {
    try {
      await pauseTimeEntry(entryId);
      toast.success("Session paused");
      fetchTimeEntries();
      fetchActiveSessions();
    } catch (error) {
      console.error("Error pausing time tracking:", error);
      toast.error("Could not pause session");
    }
  };
  
  const handleStopTimeEntry = async (entryId: string) => {
    try {
      // Utiliser le nouveau format d'URL avec /detail/
      navigate(`/time-tracking/detail/${entryId}`);
      toast.info("Accès à la page de clôture de la session");
    } catch (error) {
      console.error("Error navigating to time entry detail:", error);
      toast.error("Impossible d'accéder à la page de clôture");
    }
  };
  
  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await timeTrackingService.deleteTimeEntry(entryId);
      toast.success("Session deleted");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
      toast.error("Could not delete session");
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
    handlePauseTimeEntry,
    handleStopTimeEntry,
    handleDeleteTimeEntry,
    setIsFormOpen,
    setActiveTab,
    setDateRange,
    setEquipmentFilter,
    setTaskTypeFilter,
  };
}
