import React from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { SessionTimer } from '@/components/time-tracking/detail/SessionTimer';
import { SessionInfo } from '@/components/time-tracking/detail/SessionInfo';
import { SessionNotes } from '@/components/time-tracking/detail/SessionNotes';
import { SessionActions } from '@/components/time-tracking/detail/SessionActions';
import { SessionControls } from '@/components/time-tracking/detail/SessionControls';
import { CostEstimate } from '@/components/time-tracking/detail/CostEstimate';
import { useTimeEntryDetail } from '@/hooks/time-tracking/useTimeEntryDetail';
import { TimeEntryDetailLoading } from '@/components/time-tracking/detail/TimeEntryDetailError';
import { TimeEntryDetailError } from '@/components/time-tracking/detail/TimeEntryDetailLoading';
import { SessionClosure } from '@/components/time-tracking/detail/closure/SessionClosure';

const TimeEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const {
    entry,
    isLoading,
    estimatedCost,
    showClosureDialog,
    handlePauseResume,
    handleStop,
    handleCloseClosureDialog,
    handleNotesChange,
    handleCreateIntervention,
  } = useTimeEntryDetail(id);

  if (isLoading) {
    return <TimeEntryDetailLoading />;
  }

  if (!entry) {
    return <TimeEntryDetailError />;
  }

  // Convert the TimeEntryStatus to the expected component prop type
  const safeStatus: 'active' | 'paused' | 'completed' = 
    entry?.status === 'disputed' ? 'completed' : entry?.status || 'completed';
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1">
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1 w-full md:w-auto">
                  <SessionTimer 
                    startTime={new Date(entry.start_time)} 
                    status={safeStatus}
                  />
                </div>
                <SessionControls
                  status={safeStatus}
                  onPauseResume={handlePauseResume}
                  onStop={handleStop}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <SessionInfo
                  userName={entry.user_name || 'Utilisateur'}
                  taskType={entry.task_type}
                  equipmentId={entry.equipment_id}
                  equipmentName={entry.equipment_name}
                  location={entry.location}
                />
                <CostEstimate cost={estimatedCost} />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <SessionNotes
                  notes={entry.notes}
                  onChange={handleNotesChange}
                  readOnly={safeStatus === 'completed'}
                />
                <SessionActions
                  status={safeStatus}
                  onFileUpload={() => {}}
                  onCreateIntervention={handleCreateIntervention}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {entry && showClosureDialog && (
        <SessionClosure
          isOpen={showClosureDialog}
          onClose={handleCloseClosureDialog}
          entry={entry}
          estimatedCost={estimatedCost}
          onCreateIntervention={handleCreateIntervention}
        />
      )}
    </SidebarProvider>
  );
};

export default TimeEntryDetail;
