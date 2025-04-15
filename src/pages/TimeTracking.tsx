
import React, { useState, useEffect } from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, ListFilter, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useTimeTracking } from '@/hooks/time-tracking/useTimeTracking';
import { useActiveSessionMonitoring } from '@/hooks/time-tracking/useActiveSessionMonitoring';
import { TimeTrackingStats } from '@/components/time-tracking/dashboard/TimeTrackingStats';
import { TimeTrackingFilters } from '@/components/time-tracking/dashboard/TimeTrackingFilters';
import { TimeBreakdownChart } from '@/components/time-tracking/TimeBreakdownChart';
import { ActiveSessionPanel } from '@/components/time-tracking/ActiveSessionPanel';
import { TimeEntriesList } from '@/components/time-tracking/TimeEntriesList';
import { TimeEntryForm } from '@/components/time-tracking/TimeEntryForm';
import { useTimeEntries } from '@/hooks/time-tracking/useTimeEntries';
import { startOfWeek, endOfWeek } from 'date-fns';
import { ActiveTimeEntry } from '@/hooks/time-tracking/types';

export default function TimeTracking() {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [equipments, setEquipments] = useState<{ id: number; name: string }[]>([]);
  
  const { 
    activeTimeEntry, 
    isLoading: isActiveSessionLoading, 
    startTimeEntry, 
    stopTimeEntry, 
    pauseTimeEntry, 
    resumeTimeEntry 
  } = useTimeTracking();
  
  const {
    entries,
    isLoading: isEntriesLoading,
    dateRange,
    setDateRange,
    equipmentFilter,
    setEquipmentFilter,
    taskTypeFilter,
    setTaskTypeFilter,
    handleDeleteTimeEntry,
    refreshEntries
  } = useTimeEntries(userId);
  
  useActiveSessionMonitoring(activeTimeEntry);

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

    if (userId) {
      fetchEquipments();
    }
  }, [userId]);

  const handleStartTimeEntry = async (data: any) => {
    if (!userId) return;
    
    try {
      await startTimeEntry(data);
      setIsFormOpen(false);
      refreshEntries();
    } catch (error) {
      console.error("Error starting time tracking:", error);
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
            
            <TimeTrackingStats 
              stats={{
                totalToday: 0,
                totalWeek: 0,
                totalMonth: 0
              }} 
              isLoading={isEntriesLoading} 
            />
            
            {activeTimeEntry && (
              <ActiveSessionPanel
                activeTimeEntry={activeTimeEntry as ActiveTimeEntry}
                onPause={pauseTimeEntry}
                onResume={resumeTimeEntry}
                onStop={stopTimeEntry}
              />
            )}
            
            <TimeTrackingFilters
              dateRange={dateRange}
              equipmentFilter={equipmentFilter}
              taskTypeFilter={taskTypeFilter}
              equipments={equipments}
              onDateRangeChange={setDateRange}
              onEquipmentChange={setEquipmentFilter}
              onTaskTypeChange={setTaskTypeFilter}
              onReset={() => {
                setDateRange({
                  from: startOfWeek(new Date(), { weekStartsOn: 1 }),
                  to: endOfWeek(new Date(), { weekStartsOn: 1 })
                });
                setEquipmentFilter(undefined);
                setTaskTypeFilter(undefined);
              }}
            />
            
            <TimeBreakdownChart data={[]} />
            
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
                <TimeEntriesList
                  entries={entries}
                  isLoading={isEntriesLoading}
                  onResume={resumeTimeEntry}
                  onDelete={handleDeleteTimeEntry}
                  onNewSession={() => setIsFormOpen(true)}
                />
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
