
import React, { useState, useEffect } from 'react';
import { useTasksManager } from '@/hooks/maintenance/useTasksManager';
import { useMaintenanceRealtime } from '@/hooks/maintenance/useMaintenanceRealtime';
import { MaintenanceTask, MaintenanceFormValues } from '@/hooks/maintenance/maintenanceSlice';
import NewTaskDialog from '@/components/maintenance/NewTaskDialog';
import MaintenanceHeader from '@/components/maintenance/MaintenanceHeader';
import MaintenanceContent from '@/components/maintenance/MaintenanceContent';
import { Sidebar, SidebarProvider } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/layout/Navbar';
import MaintenanceDashboard from '@/components/dashboard/MaintenanceDashboard';
import MaintenanceNotificationsPopover from '@/components/maintenance/notifications/MaintenanceNotificationsPopover';
import MaintenanceCompletionDialog from '@/components/maintenance/dialogs/MaintenanceCompletionDialog';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';

const Maintenance = () => {
  const [currentView, setCurrentView] = useState('upcoming');
  const [dashboardView, setDashboardView] = useState('tasks');
  const [currentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  // Get user information from the auth context
  const {
    user,
    profileData,
    isAuthenticated
  } = useAuthContext();
  
  const {
    tasks,
    isLoading,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask,
    refreshTasks
  } = useTasksManager();
  
  // Use the realtime hook with refreshTasks as callback
  const { isSubscribed, error: realtimeError } = useMaintenanceRealtime(
    () => refreshTasks(), // Refresh on insert
    () => refreshTasks(), // Refresh on update
    () => refreshTasks()  // Refresh on delete
  );

  // Show error toast if we have subscription issues
  useEffect(() => {
    if (realtimeError) {
      console.error('Realtime subscription error:', realtimeError);
      toast.error('Erreur de connexion en temps réel. Les modifications peuvent ne pas être visibles immédiatement.');
    }
  }, [realtimeError]);
  
  // Vérifier que l'utilisateur est connecté
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast.error('Vous devez être connecté pour gérer les tâches de maintenance');
      }
    };
    
    checkAuth();
  }, []);
  
  const handleOpenNewTaskDialog = (open: boolean) => {
    if (!open) {
      setSelectedDate(undefined);
    }
    setIsNewTaskDialogOpen(open);
  };
  
  const handleAddTask = async (formData: MaintenanceFormValues): Promise<any> => {
    console.log('Adding task in Maintenance component:', formData);
    
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour ajouter une tâche');
      return null;
    }
    
    try {
      // Make sure we pass all required data
      const newTask = await addTask({
        ...formData,
        status: 'scheduled' as MaintenanceStatus
      });
      console.log('Task added successfully:', newTask);
      toast.success('Tâche de maintenance ajoutée avec succès');
      return newTask;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      toast.error('Échec de l\'ajout de la tâche: ' + (error.message || 'Erreur inconnue'));
      return null;
    }
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
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r">
          <Navbar />
        </Sidebar>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="text-sm text-muted-foreground">
              {isAuthenticated ? <span>Connecté en tant que : <span className="font-medium">{getUserDisplayName()}</span></span> : <span>Non connecté</span>}
            </div>
            <MaintenanceNotificationsPopover />
          </div>
          
          <LayoutWrapper>
            <PageHeader 
              title="Maintenance" 
              description="Suivez et planifiez l'entretien de vos équipements"
            />
            <Tabs defaultValue="tasks" value={dashboardView} onValueChange={setDashboardView}>
              <div className="flex justify-between items-center mb-6 flex-wrap gap-y-3">
                <TabsList>
                  <TabsTrigger value="tasks">Tâches</TabsTrigger>
                  <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
                </TabsList>
                
                <MaintenanceHeader setIsNewTaskDialogOpen={setIsNewTaskDialogOpen} userName={getUserDisplayName()} />
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
          </LayoutWrapper>
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
    </SidebarProvider>
  );
};

export default Maintenance;
