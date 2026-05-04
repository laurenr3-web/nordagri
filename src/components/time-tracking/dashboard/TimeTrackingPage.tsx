import React, { useState } from 'react';
import { TimeTrackingHeader } from './TimeTrackingHeader';
import { TimeTrackingTabs } from './TimeTrackingTabs';
import { TimeEntryForm } from '../TimeEntryForm';
import { useTimeTrackingData } from '@/hooks/time-tracking/useTimeTrackingData';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { QuickStartChoice } from './QuickStartGrid';

export default function TimeTrackingPage() {
  const {
    entries,
    isLoading,
    activeTab,
    isFormOpen,
    stats,
    equipments,
    activeTimeEntry,
    dateRange,
    equipmentFilter,
    taskTypeFilter,
    handleStartTimeEntry,
    handleResumeTimeEntry,
    handleStopTimeEntry,
    handlePauseTimeEntry,
    setIsFormOpen,
    setActiveTab,
    setDateRange,
    setEquipmentFilter,
    setTaskTypeFilter,
  } = useTimeTrackingData();

  const [defaultTaskType, setDefaultTaskType] = useState<TimeEntryTaskType | undefined>(undefined);
  const [initialData, setInitialData] = useState<any>(undefined);

  const openForm = (choice?: QuickStartChoice) => {
    if (choice) {
      setDefaultTaskType(choice.taskType);
      setInitialData(
        choice.customTaskType
          ? { task_type: choice.taskType, custom_task_type: choice.customTaskType }
          : { task_type: choice.taskType }
      );
    } else {
      setDefaultTaskType(undefined);
      setInitialData(undefined);
    }
    setIsFormOpen(true);
  };

  // Default tab to "day" — fall back when legacy/removed tabs are requested
  const tab =
    activeTab === 'list' ||
    activeTab === 'statistics' ||
    activeTab === 'rapport' ||
    activeTab === 'reports'
      ? 'day'
      : activeTab;
  const handleTabChange = (t: string) => setActiveTab(t);

  return (
    <div className="flex flex-col gap-5 sm:gap-6 min-w-0">
      <TimeTrackingHeader onNewSession={() => openForm()} />

      <TimeTrackingTabs
        activeTab={tab || 'day'}
        onTabChange={handleTabChange}
        activeTimeEntry={activeTimeEntry}
        entries={entries}
        isLoading={isLoading}
        stats={stats}
        equipments={equipments}
        dateRange={dateRange}
        setDateRange={setDateRange}
        equipmentFilter={equipmentFilter}
        setEquipmentFilter={setEquipmentFilter}
        taskTypeFilter={taskTypeFilter}
        setTaskTypeFilter={setTaskTypeFilter}
        onPause={handlePauseTimeEntry}
        onResume={handleResumeTimeEntry}
        onStop={handleStopTimeEntry}
        onNewSession={() => openForm()}
        onQuickStart={openForm}
      />

      <TimeEntryForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleStartTimeEntry}
        defaultTaskType={defaultTaskType}
        initialData={initialData}
      />
    </div>
  );
}
