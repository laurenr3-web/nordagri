
import React from 'react';
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
    <div className="flex flex-col gap-6">
      <TimeTrackingHeader
        onNewSession={() => setIsFormOpen(true)}
      />

      {/* Résumé du temps */}
      <TimeTrackingSummary 
        stats={stats} 
        isLoading={isLoading} 
      />

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

      {/* Sessions actives */}
      <ActiveSessionsTable
        sessions={activeSessions}
        onPause={handlePauseTimeEntry}
        onResume={handleResumeTimeEntry}
        onStop={handleStopTimeEntry}
      />

      {/* Onglets */}
      <TimeTrackingTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        entries={entries}
        isLoading={isLoading}
        onNewSession={() => setIsFormOpen(true)}
        onResumeEntry={handleResumeTimeEntry}
        onDeleteEntry={handleDeleteTimeEntry}
      />
      
      <TimeEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleStartTimeEntry}
      />
    </div>
  );
}
