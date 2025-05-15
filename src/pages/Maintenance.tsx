
import React from 'react';
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
    handleOpenNewTaskDialog,
    handleAddTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask,
    refreshTasks,
    getUserDisplayName
  } = useMaintenancePage();
  
  return (
    <MainLayout>
      <div className="flex items-center justify-end p-4 border-b">
        <MaintenanceNotificationsPopover />
      </div>
      
      <LayoutWrapper>
        <PageHeader 
          title="Maintenance" 
          description="Suivez et planifiez l'entretien de vos équipements"
          action={
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
                <FileDown className="h-4 w-4 mr-2" />
                <span>Import entretiens fabricant</span>
              </Button>
              <Button onClick={() => setIsNewTaskDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                <span>Nouvelle tâche</span>
              </Button>
            </div>
          }
        />
        
        <Tabs defaultValue="tasks" value={dashboardView} onValueChange={setDashboardView}>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-y-3">
            <TabsList>
              <TabsTrigger value="tasks">Tâches</TabsTrigger>
              <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="tasks">
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
