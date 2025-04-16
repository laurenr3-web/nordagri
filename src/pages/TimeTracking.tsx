import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ListFilter, CalendarIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { TimeEntryForm } from '@/components/time-tracking/TimeEntryForm';
import { startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { TimeEntryCard } from '@/components/time-tracking/TimeEntryCard';
import { ActiveSessionsTable } from '@/components/time-tracking/ActiveSessionsTable';
import { TimeBreakdownChart } from '@/components/time-tracking/TimeBreakdownChart';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { useActiveSessionMonitoring } from '@/hooks/time-tracking/useActiveSessionMonitoring';
import { TimeTrackingStats } from '@/components/time-tracking/dashboard/TimeTrackingStats';
import { TimeTrackingFilters } from '@/components/time-tracking/dashboard/TimeTrackingFilters';
import { Skeleton } from '@/components/ui/skeleton';

export default function TimeTracking() {
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
  
  useActiveSessionMonitoring(activeTimeEntry as TimeEntry);
  
  const [dateRange, setDateRange<{ from: Date; to: Date }>({
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
  
  const [timeBreakdownData, setTimeBreakdownData<Array<{
    task_type: string;
    minutes: number;
    color: string;
  }>>([]);
  
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
      fetchTimeBreakdown();
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
  
  const fetchTimeBreakdown = async () => {
    try {
      const mockData = [
        { task_type: "Traite", minutes: 180, color: "#10B981" },
        { task_type: "Entretien", minutes: 240, color: "#67E8F9" },
        { task_type: "Plantation", minutes: 210, color: "#6EE7B7" },
        { task_type: "Mécanique", minutes: 120, color: "#6B7280" }
      ];
      
      setTimeBreakdownData(mockData);
    } catch (error) {
      console.error("Error fetching time breakdown:", error);
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
      await stopTimeEntry(entryId);
      toast.success("Session completed");
      fetchTimeEntries();
      fetchActiveSessions();
    } catch (error) {
      console.error("Error stopping time tracking:", error);
      toast.error("Could not stop session");
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 overflow-y-auto">
          <div className="container py-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Time Tracking</h1>
              <Button 
                id="start-time-session-btn"
                onClick={() => setIsFormOpen(true)} 
                className="bg-green-600 hover:bg-green-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                New Session
              </Button>
            </div>
            
            <TimeTrackingStats stats={stats} isLoading={isLoading} />
            
            {activeTimeEntry && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <User className="h-10 w-10 text-blue-500" />
                      <div>
                        <div className="text-sm text-blue-700">
                          {activeTimeEntry.user_name || activeTimeEntry.owner_name || 'Non assigné'}
                        </div>
                        <div className="text-3xl font-mono font-bold text-blue-900">
                          {activeTimeEntry.current_duration || "00:00:00"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center mt-4 md:mt-0">
                      <div className="text-sm text-blue-700">
                        {activeTimeEntry.task_type === 'other' 
                          ? activeTimeEntry.custom_task_type 
                          : activeTimeEntry.task_type} {activeTimeEntry.equipment_name ? `- ${activeTimeEntry.equipment_name}` : ''}
                      </div>
                      <div className="text-sm text-blue-700">
                        {activeTimeEntry.location || 'No location'}
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 mt-4 md:mt-0">
                      <span className="mr-2 text-blue-700">
                        {activeTimeEntry.status === 'active' ? 'In Progress' : 'Paused'}
                      </span>
                      {activeTimeEntry.status === 'active' ? (
                        <Button
                          onClick={() => handlePauseTimeEntry(activeTimeEntry.id)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Pause
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleResumeTimeEntry(activeTimeEntry.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Resume
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() => handleStopTimeEntry(activeTimeEntry.id)}
                      >
                        Terminer
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <TimeTrackingFilters
              dateRange={dateRange}
              equipmentFilter={equipmentFilter}
              taskTypeFilter={taskTypeFilter}
              equipments={equipments}
              onDateRangeChange={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
              onEquipmentChange={(value) => setEquipmentFilter(value)}
              onTaskTypeChange={(value) => setTaskTypeFilter(value)}
              onReset={() => {
                setDateRange({
                  from: startOfWeek(new Date(), { weekStartsOn: 1 }),
                  to: endOfWeek(new Date(), { weekStartsOn: 1 })
                });
                setEquipmentFilter(undefined);
                setTaskTypeFilter(undefined);
              }}
            />
            
            <TimeBreakdownChart data={timeBreakdownData} />
            
            <ActiveSessionsTable
              sessions={activeSessions}
              onPause={handlePauseTimeEntry}
              onResume={handleResumeTimeEntry}
              onStop={handleStopTimeEntry}
            />
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
              <TabsList className="mb-4">
                <TabsTrigger value="list">
                  <ListFilter className="h-4 w-4 mr-2" />
                  List
                </TabsTrigger>
                <TabsTrigger value="calendar">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Calendar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array(6).fill(0).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-0">
                          <div className="p-4">
                            <Skeleton className="h-6 w-24 mb-3" />
                            <Skeleton className="h-5 w-full mb-2" />
                            <Skeleton className="h-4 w-1/2 mb-4" />
                            <div className="flex justify-between">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-12" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  entries.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entries.map((entry) => (
                        <TimeEntryCard
                          key={entry.id}
                          entry={entry}
                          onResume={handleResumeTimeEntry}
                          onDelete={handleDeleteTimeEntry}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-md bg-gray-50">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-xl font-medium mb-2">No sessions found</h3>
                      <p className="text-gray-500 mb-4">
                        No time sessions match your search criteria.
                      </p>
                      <Button onClick={() => setIsFormOpen(true)}>
                        Start a session
                      </Button>
                    </div>
                  )
                )}
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="border rounded-lg p-6">
                  <div className="text-center">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">Calendar View</h3>
                    <p className="text-gray-500 mb-4">
                      This feature will be available soon.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <TimeEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleStartTimeEntry}
      />
    </SidebarProvider>
  );
}
