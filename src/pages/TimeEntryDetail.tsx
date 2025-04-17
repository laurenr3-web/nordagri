
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import { SessionTimer } from '@/components/time-tracking/detail/SessionTimer';
import { SessionInfo } from '@/components/time-tracking/detail/SessionInfo';
import { SessionNotes } from '@/components/time-tracking/detail/SessionNotes';
import { SessionActions } from '@/components/time-tracking/detail/SessionActions';
import { SessionControls } from '@/components/time-tracking/detail/SessionControls';
import { CostEstimate } from '@/components/time-tracking/detail/CostEstimate';
import { useTimeEntryDetail } from '@/hooks/time-tracking/useTimeEntryDetail';
import { TimeEntryDetailLoading } from '@/components/time-tracking/detail/TimeEntryDetailLoading';
import { TimeEntryDetailError } from '@/components/time-tracking/detail/TimeEntryDetailError';
import { SessionClosure } from '@/components/time-tracking/detail/closure/SessionClosure';
import { TimeEntryStatus } from '@/hooks/time-tracking/types';
import { TimeEntryForm } from '@/components/time-tracking/TimeEntryForm';
import { Button } from '@/components/ui/button';

const TimeEntryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isNewTaskFormOpen, setIsNewTaskFormOpen] = useState(false);
  
  const {
    entry,
    isLoading,
    estimatedCost,
    showClosureDialog,
    handlePauseResume,
    handleStop,
    handleCloseClosureDialog,
    handleSubmitClosureForm,
    handleNotesChange,
    handleCreateIntervention,
    prepareNewTaskData
  } = useTimeEntryDetail(id);

  // Afficher automatiquement la boîte de dialogue de clôture pour les sessions actives ou en pause
  useEffect(() => {
    if (entry && (entry.status === 'active' || entry.status === 'paused') && !showClosureDialog) {
      handleStop();
    }
  }, [entry?.id, entry?.status]);

  const handleStartNewTask = () => {
    setIsNewTaskFormOpen(true);
  };

  const handleSubmitNewTask = async (data: any) => {
    try {
      const newEntryId = await prepareNewTaskData(data);
      setIsNewTaskFormOpen(false);
      if (newEntryId) {
        navigate(`/time-tracking/detail/${newEntryId}`);
      }
    } catch (error) {
      console.error('Error starting new task:', error);
    }
  };

  if (isLoading) {
    return <TimeEntryDetailLoading />;
  }

  if (!entry) {
    return <TimeEntryDetailError />;
  }

  // Convert the TimeEntryStatus to the expected component prop type
  const safeStatus: 'active' | 'paused' | 'completed' = 
    entry.status === 'disputed' ? 'completed' : entry.status as 'active' | 'paused' | 'completed';
  
  // Get display name from available properties
  const displayName = entry.user_name || entry.owner_name || 'Utilisateur';
  
  // Prepare initial data for the form if entry exists
  const initialFormData = entry ? {
    equipment_id: entry.equipment_id,
    intervention_id: entry.intervention_id,
    task_type: entry.task_type,
    custom_task_type: entry.custom_task_type,
    location_id: entry.location ? parseInt(entry.location) : undefined,
    location: entry.location,
    title: `Suite: ${entry.task_type} - ${new Date().toLocaleString()}`
  } : undefined;
  
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
                    endTime={entry.end_time ? new Date(entry.end_time) : null}
                    status={safeStatus}
                  />
                </div>
                {safeStatus !== 'completed' && (
                  <SessionControls
                    status={safeStatus}
                    onPauseResume={handlePauseResume}
                    onStop={handleStop}
                  />
                )}
                {safeStatus === 'completed' && (
                  <Button 
                    variant="outline" 
                    className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                    onClick={handleStartNewTask}
                  >
                    Commencer une nouvelle tâche
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <SessionInfo
                  userName={displayName}
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

              {entry.intervention_id && (
                <div className="border rounded-md p-4 bg-blue-50">
                  <h3 className="text-md font-medium mb-2">Intervention associée</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Cette session fait partie d'une intervention plus large. Vous pouvez consulter toutes les sessions
                    associées à cette intervention.
                  </p>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/interventions/detail/${entry.intervention_id}`)}
                  >
                    Voir l'intervention
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {entry && showClosureDialog && (
        <SessionClosure
          isOpen={showClosureDialog}
          onClose={handleCloseClosureDialog}
          onSubmit={handleSubmitClosureForm}
          onStartNewTask={handleStartNewTask}
          entry={entry}
          estimatedCost={estimatedCost}
          onCreateIntervention={handleCreateIntervention}
        />
      )}

      <TimeEntryForm
        isOpen={isNewTaskFormOpen}
        onOpenChange={setIsNewTaskFormOpen}
        onSubmit={handleSubmitNewTask}
        initialData={initialFormData}
      />
    </SidebarProvider>
  );
};

export default TimeEntryDetail;
