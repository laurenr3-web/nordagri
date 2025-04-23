
import React from 'react';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { TimeTrackingHeader } from './TimeTrackingHeader';
import { ActiveTimeSession } from './ActiveTimeSession';
import { TimeTrackingSummary } from './TimeTrackingSummary';
import { TimeTrackingFilters } from '../dashboard/TimeTrackingFilters';
import { ActiveSessionsTable } from '../ActiveSessionsTable';
import { TimeEntryForm } from '../TimeEntryForm';
import { TimeTrackingTabs } from './TimeTrackingTabs';
import { startOfWeek, endOfWeek } from 'date-fns';
import { useTimeTrackingData } from '@/hooks/time-tracking/useTimeTrackingData';

// Hook utilitaire pour détecter le desktop (>=1024px)
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState(false);

  React.useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return isDesktop;
}

export default function TimeTrackingPage() {
  const isDesktop = useIsDesktop();
  const {
    userId,
    entries,
    isLoading,
    activeTab,
    isFormOpen,
    stats,
    equipments,
    activeSessions,
    handleStartTimeEntry,
    handleResumeTimeEntry,
    handlePauseTimeEntry,
    handleStopTimeEntry,
    handleDeleteTimeEntry,
    setIsFormOpen,
    setActiveTab,
    activeTimeEntry,
    dateRange,
    setDateRange,
    equipmentFilter,
    setEquipmentFilter,
    taskTypeFilter,
    setTaskTypeFilter,
  } = useTimeTrackingData();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="w-full px-3 sm:px-4 md:px-6 lg:max-w-screen-2xl lg:mx-auto lg:px-8">
            <TimeTrackingHeader
              onNewSession={() => setIsFormOpen(true)}
            />
            
            <TimeTrackingSummary stats={stats} isLoading={isLoading} />
            
            {activeTimeEntry && (
              <ActiveTimeSession
                session={activeTimeEntry}
                onPause={handlePauseTimeEntry}
                onResume={handleResumeTimeEntry}
                onStop={handleStopTimeEntry}
              />
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
            
            <ActiveSessionsTable
              sessions={activeSessions}
              onPause={handlePauseTimeEntry}
              onResume={handleResumeTimeEntry}
              onStop={handleStopTimeEntry}
            />
            
            <TimeTrackingTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              entries={entries}
              isLoading={isLoading}
              onNewSession={() => setIsFormOpen(true)}
              onResumeEntry={handleResumeTimeEntry}
              onDeleteEntry={handleDeleteTimeEntry}
            />
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
