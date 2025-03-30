
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaintenanceDashboard from '@/components/dashboard/MaintenanceDashboard';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';
import MaintenanceCompletionDialog from '@/components/maintenance/dialogs/MaintenanceCompletionDialog';

const Maintenance = () => {
  const [currentView, setCurrentView] = useState('upcoming');
  const [dashboardView, setDashboardView] = useState('tasks');
  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  
  const {
    tasks, 
    isLoading,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  } = useTasksManager();

  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  // Handle opening dialog with a preselected date
  const handleOpenNewTaskDialog = (open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
    }
    setIsNewTaskDialogOpen(open);
  };

  const handleAddTask = (formData: any) => {
    console.log('Adding task in Maintenance component:', formData);
    return addTask({
      ...formData,
      status: 'scheduled' as MaintenanceStatus
    });
  };
  
  const handleCompleteTask = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsCompletionDialogOpen(true);
    }
  };

  useEffect(() => {
    console.log('Maintenance component loaded with tasks:', tasks);
  }, [tasks]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="flex justify-end p-4 border-b">
            <MaintenanceNotificationsPopover />
          </div>
          
          <div className="pt-6 pb-16 px-4 sm:px-8 md:px-12">
            <div className="max-w-7xl mx-auto">
              <Tabs defaultValue="tasks" value={dashboardView} onValueChange={setDashboardView}>
                <div className="flex justify-between items-center mb-6">
                  <TabsList>
                    <TabsTrigger value="tasks">Tâches</TabsTrigger>
                    <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                  </TabsList>
                  
                  <MaintenanceHeader 
                    setIsNewTaskDialogOpen={setIsNewTaskDialogOpen} 
                  />
                </div>
                
                <TabsContent value="tasks">
                  <MaintenanceContent 
                    tasks={tasks}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    currentMonth={currentMonth}
                    setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
                    updateTaskStatus={(taskId, status) => updateTaskStatus(taskId, status)}
                    updateTaskPriority={updateTaskPriority}
                    deleteTask={deleteTask}
                  />
                </TabsContent>
                
                <TabsContent value="dashboard">
                  <MaintenanceDashboard tasks={tasks} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      
      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={handleOpenNewTaskDialog}
        onSubmit={handleAddTask}
        initialDate={selectedDate}
      />
      
      <MaintenanceCompletionDialog
        isOpen={isCompletionDialogOpen}
        onClose={() => setIsCompletionDialogOpen(false)}
        task={selectedTask}
        onCompleted={() => {
          setIsCompletionDialogOpen(false);
          // Rafraîchir la liste des tâches
        }}
      />
    </SidebarProvider>
  );
};

export default Maintenance;
