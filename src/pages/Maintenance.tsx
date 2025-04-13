
import React, { useState, useEffect } from 'react';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority, MaintenanceFormValues } from '@/hooks/maintenance/maintenanceSlice';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MaintenanceDashboard from '@/components/dashboard/MaintenanceDashboard';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';
import MaintenanceCompletionDialog from '@/components/maintenance/dialogs/MaintenanceCompletionDialog';
import { useAuthContext } from '@/providers/AuthProvider';

const Maintenance = () => {
  const [currentView, setCurrentView] = useState('upcoming');
  const [dashboardView, setDashboardView] = useState('tasks');
  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  
  // Get user information from the auth context
  const { user, profileData, isAuthenticated } = useAuthContext();
  
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

  const handleAddTask = async (formData: MaintenanceFormValues): Promise<any> => {
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
    // Log user information
    console.log('Current user:', user);
    console.log('Profile data:', profileData);
  }, [tasks, user, profileData]);
  
  // Get user display name for the maintenance context
  const getUserDisplayName = () => {
    if (profileData && (profileData.first_name || profileData.last_name)) {
      return `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
    }
    return user?.email || 'Utilisateur';
  };
  
  return (
    <div className="flex-1">
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <div className="text-sm text-muted-foreground">
          {isAuthenticated ? (
            <span>Connecté en tant que : <span className="font-medium">{getUserDisplayName()}</span></span>
          ) : (
            <span>Non connecté</span>
          )}
        </div>
        <MaintenanceNotificationsPopover />
      </div>
      
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="tasks" value={dashboardView} onValueChange={setDashboardView}>
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="tasks">Tâches</TabsTrigger>
                <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
              </TabsList>
              
              <MaintenanceHeader 
                setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
                userName={getUserDisplayName()}
              />
            </div>
            
            <TabsContent value="tasks">
              <MaintenanceContent 
                tasks={tasks}
                currentView={currentView}
                setCurrentView={setCurrentView}
                currentMonth={currentMonth}
                setIsNewTaskDialogOpen={setIsNewTaskDialogOpen}
                updateTaskStatus={(taskId, status: MaintenanceStatus) => updateTaskStatus(taskId, status)}
                updateTaskPriority={updateTaskPriority}
                deleteTask={deleteTask}
                userName={getUserDisplayName()}
              />
            </TabsContent>
            
            <TabsContent value="dashboard">
              <MaintenanceDashboard 
                tasks={tasks} 
                userName={getUserDisplayName()}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <NewTaskDialog 
        open={isNewTaskDialogOpen}
        onOpenChange={handleOpenNewTaskDialog}
        onSubmit={handleAddTask}
        initialDate={selectedDate}
        userName={getUserDisplayName()}
      />
      
      <MaintenanceCompletionDialog
        open={isCompletionDialogOpen}
        onClose={() => setIsCompletionDialogOpen(false)}
        task={selectedTask}
        onCompleted={() => {
          setIsCompletionDialogOpen(false);
          // Rafraîchir la liste des tâches
        }}
        userName={getUserDisplayName()}
      />
    </div>
  );
};

export default Maintenance;
