
import { useState, useEffect } from 'react';
import { useTasksManager } from './useTasksManager';
import { useMaintenanceRealtime } from './useMaintenanceRealtime';
import { MaintenanceFormValues, MaintenanceStatus, MaintenanceTask } from './maintenanceSlice';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

export const useMaintenancePage = () => {
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

  return {
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
    tasks,
    isLoading,
    handleOpenNewTaskDialog,
    handleAddTask,
    handleCompleteTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask,
    refreshTasks,
    getUserDisplayName
  };
};
