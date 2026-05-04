
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/ui/layouts/MainLayout';
import { useMaintenancePage } from '@/hooks/maintenance/useMaintenancePage';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaintenanceDashboard from '@/components/dashboard/MaintenanceDashboard';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';
import MaintenanceCompletionDialog from '@/components/maintenance/dialogs/MaintenanceCompletionDialog';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { FileDown, Plus } from 'lucide-react';
import ImportMaintenanceDialog from '@/components/maintenance/dialogs/ImportMaintenanceDialog';
import { MaintenanceTourTrigger } from '@/components/onboarding/MaintenanceTourTrigger';
import { EmptyState } from '@/components/help/EmptyState';
import { emptyStates } from '@/content/help/emptyStates';

const Maintenance = () => {
  const {
    currentView,
    setCurrentView,
    dashboardView,
    setDashboardView,
    currentMonth,
    selectedDate,
    selectedTask,
    isCompletionDialogOpen,
    setIsCompletionDialogOpen,
    isNewTaskDialogOpen,
    setIsNewTaskDialogOpen,
    isImportDialogOpen,
    setIsImportDialogOpen,
    tasks,
    isLoading,
    handleOpenNewTaskDialog,
    handleAddTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask,
    refreshTasks,
    getUserDisplayName
  } = useMaintenancePage();

  const [searchParams] = useSearchParams();
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'late') {
      setDashboardView('tasks');
      setCurrentView('overdue');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const handler = () => setIsNewTaskDialogOpen(true);
    window.addEventListener('maintenance:n-task', handler);
    return () => window.removeEventListener('maintenance:n-task', handler);
  }, [setIsNewTaskDialogOpen]);

  return (
    <MainLayout>
      <MaintenanceTourTrigger isLoading={isLoading} />
      <div className="flex items-center justify-end p-4 border-b">
        <MaintenanceNotificationsPopover />
      </div>
      
      <LayoutWrapper>
        <PageHeader 
          title="Maintenance" 
          description="Suivez et planifiez l'entretien de vos équipements"
          action={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                <FileDown className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Import entretiens fabricant</span>
                <span className="sm:hidden">Import</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsNewTaskDialogOpen(true)}
                data-tour="maintenance-new-task"
              >
                <Plus className="h-4 w-4 mr-1.5" />
                <span>Nouvelle tâche</span>
              </Button>
            </div>
          }
        />
        
        <Tabs defaultValue="tasks" value={dashboardView} onValueChange={setDashboardView}>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-y-3">
            <TabsList data-tour="maintenance-tabs">
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="tasks">
            {!isLoading && tasks.length === 0 ? (
              <EmptyState
                icon={emptyStates.maintenanceList.icon}
                title={emptyStates.maintenanceList.title}
                description={emptyStates.maintenanceList.description}
                action={{
                  label: emptyStates.maintenanceList.actionLabel,
                  onClick: () => setIsNewTaskDialogOpen(true),
                }}
                secondaryAction={
                  emptyStates.maintenanceList.articleId
                    ? {
                        label: emptyStates.maintenanceList.secondaryActionLabel!,
                        articleId: emptyStates.maintenanceList.articleId,
                      }
                    : undefined
                }
              />
            ) : (
              <MaintenanceContent
                tasks={tasks}
                currentView={currentView}
                setCurrentView={setCurrentView}
                currentMonth={currentMonth}
                setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
                updateTaskStatus={updateTaskStatus}
                updateTaskPriority={updateTaskPriority}
                deleteTask={deleteTask}
                userName={getUserDisplayName()}
              />
            )}
          </TabsContent>
          
          <TabsContent value="dashboard">
            <MaintenanceDashboard tasks={tasks} userName={getUserDisplayName()} />
          </TabsContent>
        </Tabs>
      
        <NewTaskDialog 
          open={isNewTaskDialogOpen} 
          onOpenChange={handleOpenNewTaskDialog} 
          onSubmit={handleAddTask} 
          initialDate={selectedDate} 
          userName={getUserDisplayName()} 
        />
        
        <MaintenanceCompletionDialog 
          isOpen={isCompletionDialogOpen} 
          onClose={() => setIsCompletionDialogOpen(false)} 
          task={selectedTask} 
          onCompleted={() => {
            setIsCompletionDialogOpen(false);
            // Refresh the task list
            refreshTasks();
          }} 
          userName={getUserDisplayName()} 
        />
        
        <ImportMaintenanceDialog
          isOpen={isImportDialogOpen}
          onClose={() => setIsImportDialogOpen(false)}
        />
      </LayoutWrapper>
    </MainLayout>
  );
};

export default Maintenance;
