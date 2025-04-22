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
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTimeTrackingData } from '@/hooks/time-tracking/useTimeTrackingData';
import { useExportTimeTracking } from '@/hooks/time-tracking/useExportTimeTracking';

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

  const { 
    formatTimeEntriesForExport, 
    exportTimeEntriesToPDF,
    headers,
    isExporting
  } = useExportTimeTracking();

  const exportableEntries = formatTimeEntriesForExport(entries);
  
  // Format period label for export
  const getPeriodLabel = () => {
    if (!dateRange.from || !dateRange.to) return '';
    
    const fromStr = format(dateRange.from, 'dd/MM/yyyy', { locale: fr });
    const toStr = format(dateRange.to, 'dd/MM/yyyy', { locale: fr });
    
    return `${fromStr} au ${toStr}`;
  };
  
  const handleExportPDF = async () => {
    await exportTimeEntriesToPDF(entries, getPeriodLabel());
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 overflow-y-auto">
          <div className="container py-6">
            <TimeTrackingHeader
              onNewSession={() => setIsFormOpen(true)}
              exportData={exportableEntries}
              exportHeaders={headers}
              onExportPDF={handleExportPDF}
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
