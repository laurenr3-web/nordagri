import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeEntryCard } from '@/components/time-tracking/TimeEntryCard';
import { Calendar, ListFilter, Clock, Calendar as CalendarIcon, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/hooks/time-tracking/types';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { Button } from '@/components/ui/button';
import { TimeEntryForm } from '@/components/time-tracking/TimeEntryForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { startOfWeek, endOfWeek } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ActiveSessionsTable } from '@/components/time-tracking/ActiveSessionsTable';
import { TimeBreakdownChart } from '@/components/time-tracking/TimeBreakdownChart';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { useActiveSessionMonitoring } from '@/hooks/time-tracking/useActiveSessionMonitoring';

const TimeTrackingPage = () => {
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
  
  // Use the session monitoring hook
  useActiveSessionMonitoring(activeTimeEntry as TimeEntry);
  
  // Filters
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 })
  });
  const [equipmentFilter, setEquipmentFilter] = useState<number | undefined>(undefined);
  const [taskTypeFilter, setTaskTypeFilter] = useState<string | undefined>(undefined);
  
  // Statistics
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0
  });
  
  // Time breakdown data
  const [timeBreakdownData, setTimeBreakdownData] = useState<Array<{
    task_type: string;
    minutes: number;
    color: string;
  }>>([]);
  
  // Filter options
  const [equipments, setEquipments] = useState<{ id: number; name: string }[]>([]);
  
  // Active sessions (including the current user's active session)
  const [activeSessions, setActiveSessions] = useState<TimeEntry[]>([]);
  
  // Get user ID on load
  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setUserId(data.session.user.id);
      }
    };
    
    fetchUserId();
  }, []);
  
  // Fetch time entries when user or filters change
  useEffect(() => {
    if (userId) {
      fetchTimeEntries();
      fetchEquipments();
      calculateStats();
      fetchTimeBreakdown();
      fetchActiveSessions();
    }
  }, [userId, dateRange, equipmentFilter, taskTypeFilter]);
  
  // Fetch time entries
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
  
  // Fetch active sessions from all users
  const fetchActiveSessions = async () => {
    try {
      // This is a mock implementation - in a real app, you would have 
      // a service method to fetch all active sessions from the database
      const mockSessions = [];
      
      if (activeTimeEntry) {
        mockSessions.push({
          ...activeTimeEntry,
          user_name: 'Christophe'  // In real app, get from user profile
        });
      }
      
      setActiveSessions(mockSessions);
    } catch (error) {
      console.error("Error fetching active sessions:", error);
    }
  };
  
  // Fetch time breakdown by task type
  const fetchTimeBreakdown = async () => {
    try {
      // In a real app, you would fetch this from the database
      // This is just mock data for the demo
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
  
  // Fetch equipment list for filtering
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
  
  // Calculate statistics
  const calculateStats = async () => {
    if (!userId) return;
    
    try {
      // Calculate total time today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Query for today
      const todayEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: today,
        endDate: tomorrow
      });
      
      // Calculate total time for the week (already defined in dateRange)
      const weekEntries = await timeTrackingService.getTimeEntries({
        userId,
        startDate: dateRange.from,
        endDate: dateRange.to
      });
      
      // Calculate total time for the month
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
      
      // Calculate totals in hours
      setStats({
        totalToday: calculateTotalHours(todayEntries),
        totalWeek: calculateTotalHours(weekEntries),
        totalMonth: calculateTotalHours(monthEntries)
      });
    } catch (error) {
      console.error("Error calculating statistics:", error);
    }
  };
  
  // Calculate total hours for a set of entries
  const calculateTotalHours = (entries: TimeEntry[]): number => {
    return entries.reduce((total, entry) => {
      const start = new Date(entry.start_time);
      const end = entry.end_time ? new Date(entry.end_time) : new Date();
      const diffMs = end.getTime() - start.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };
  
  // Start a new time session
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
  
  // Resume a paused session
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
  
  // Pause an active session
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
  
  // Stop an active session
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
  
  // Delete a time entry
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
            
            {/* Statistics summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Time Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : `${stats.totalToday.toFixed(1)} h`}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Time This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : `${stats.totalWeek.toFixed(1)} h`}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Time This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isLoading ? <Skeleton className="h-8 w-20" /> : `${stats.totalMonth.toFixed(1)} h`}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Active Session Display */}
            {activeTimeEntry && (
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <User className="h-10 w-10 text-blue-500" />
                      <div>
                        <div className="text-sm text-blue-700">Christophe</div>
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
            
            {/* Filters */}
            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period
                  </label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                  />
                </div>
                
                <div className="w-full md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Equipment
                  </label>
                  <Select
                    value={equipmentFilter?.toString() || ""}
                    onValueChange={(value) => setEquipmentFilter(value !== "all" ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      {equipments.map((equipment) => (
                        <SelectItem key={equipment.id} value={equipment.id.toString()}>
                          {equipment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-48">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type
                  </label>
                  <Select
                    value={taskTypeFilter || "all"}
                    onValueChange={(value) => setTaskTypeFilter(value !== "all" ? value : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="repair">Repair</SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setDateRange({
                      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
                      to: endOfWeek(new Date(), { weekStartsOn: 1 })
                    });
                    setEquipmentFilter(undefined);
                    setTaskTypeFilter(undefined);
                  }}
                >
                  Reset
                </Button>
              </div>
            </div>
            
            {/* Time Breakdown Chart */}
            <TimeBreakdownChart data={timeBreakdownData} />
            
            {/* Active Sessions Table */}
            <ActiveSessionsTable
              sessions={activeSessions}
              onPause={handlePauseTimeEntry}
              onResume={handleResumeTimeEntry}
              onStop={handleStopTimeEntry}
            />
            
            {/* Tabs */}
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
      
      {/* Modal for creating a new session */}
      <TimeEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleStartTimeEntry}
      />
    </SidebarProvider>
  );
};

export default TimeTrackingPage;
