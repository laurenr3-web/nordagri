
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

export default function TimeTrackingPage() {
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
        <div className="flex-1 overflow-y-auto">
          <div className="container py-6 max-w-screen-xl mx-auto w-full px-4 md:px-8 min-h-[600px] overflow-x-hidden">
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
            {/* FILTERS + TABS LAYOUT */}
            <div className="flex flex-col md:flex-row md:gap-6 mb-6">
              <div className="flex-1">
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
              {/* Tabs+New Session always right for desktop */}
              <div className="w-full md:w-auto flex md:justify-end items-end mt-4 md:mt-0">
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
            {/* Session table/cards */}
            <ActiveSessionsTable
              sessions={activeSessions}
              onPause={handlePauseTimeEntry}
              onResume={handleResumeTimeEntry}
              onStop={handleStopTimeEntry}
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
