
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

  // Largeur maximum adaptée mobile/desktop
  const containerClass = isDesktop
    ? "w-full max-w-screen-2xl mx-auto px-8"
    : "w-full max-w-full mx-0 px-2 sm:px-3 overflow-x-hidden";

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        <div className="flex-1 w-full max-w-full overflow-x-hidden">
          <div
            className={
              `flex flex-col w-full max-w-full overflow-x-hidden min-h-screen` +
              ` ${containerClass}`
            }
          >
            <div className="py-4 sm:py-6 flex flex-col gap-2 sm:gap-4">
              <TimeTrackingHeader
                onNewSession={() => setIsFormOpen(true)}
              />

              {/* Résumé du temps, adaptée responsive */}
              <div className="w-full">
                <TimeTrackingSummary stats={stats} isLoading={isLoading} />
              </div>

              {/* Session active */}
              {activeTimeEntry && (
                <ActiveTimeSession
                  session={activeTimeEntry}
                  onPause={handlePauseTimeEntry}
                  onResume={handleResumeTimeEntry}
                  onStop={handleStopTimeEntry}
                />
              )}

              {/* Filtres */}
              <div className="w-full">
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
              </div>

              {/* Sessions actives */}
              <div className="w-full">
                <ActiveSessionsTable
                  sessions={activeSessions}
                  onPause={handlePauseTimeEntry}
                  onResume={handleResumeTimeEntry}
                  onStop={handleStopTimeEntry}
                />
              </div>

              {/* Onglets */}
              <div className="w-full">
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

