import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenancePriority, MaintenanceStatus, MaintenanceType } from './maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { supabase } from '@/integrations/supabase/client';

export function useTasksManager(initialTasks?: MaintenanceTask[]) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(initialTasks ? false : true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Vérifier l'utilisateur actuel au chargement
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      setCurrentUser(userId || null);
    };
    
    checkCurrentUser();
  }, []);

  useEffect(() => {
    if (initialTasks) {
      console.log("Using provided initial tasks:", initialTasks);
      setTasks(initialTasks);
      return;
    }

    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("Fetching maintenance tasks from service...");
        const fetchedTasks = await maintenanceService.getTasks();
        
        if (fetchedTasks && fetchedTasks.length > 0) {
          console.log(`Found ${fetchedTasks.length} maintenance tasks:`, fetchedTasks);
          setTasks(fetchedTasks);
        } else {
          console.log("No maintenance tasks found");
          setTasks([]);
        }
      } catch (error: any) {
        console.error('Error fetching maintenance tasks:', error);
        setError(error.message || "Une erreur est survenue lors de la récupération des tâches");
        toast.error('Impossible de charger les tâches de maintenance');
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [initialTasks]);

  const addTask = async (task: Omit<MaintenanceTask, 'id'>) => {
    console.info('Adding task:', task);
    
    try {
      setIsLoading(true);
      
      // Vérifier si l'utilisateur est connecté
      if (!currentUser) {
        throw new Error("Vous devez être connecté pour ajouter une tâche");
      }
      
      // Make sure we're correctly passing all required fields
      if (!task.title || !task.equipment || !task.type || !task.priority) {
        throw new Error("Informations de tâche incomplètes");
      }
      
      // Call the service to add the task to the database
      const newTask = await maintenanceService.addTask({
        ...task,
        // S'assurer que owner_id est défini correctement via le service
      });
      
      console.log('Task added successfully:', newTask);
      
      // Update local state with the new task
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      toast.success('Tâche de maintenance créée avec succès');
      
      return newTask;
    } catch (error: any) {
      console.error('Error adding task:', error);
      toast.error('Impossible d\'ajouter la tâche de maintenance: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: MaintenanceStatus) => {
    // Mettre à jour le statut d'une tâche
    console.log(`Updating task ${taskId} status to ${newStatus}`);
    
    try {
      // Mettre à jour le statut dans la base de données (avec date de complétion automatique)
      await maintenanceService.updateTaskStatus(taskId, newStatus);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                // Ajouter la date de complétion si le statut est "completed"
                completedDate: newStatus === 'completed' ? new Date() : task.completedDate
              } 
            : task
        )
      );
      
      toast.success(`Statut mis à jour: ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating task status:', error);
      toast.error('Impossible de mettre à jour le statut: ' + error.message);
    }
  };

  const updateTaskPriority = async (taskId: number, newPriority: MaintenancePriority) => {
    // Mettre à jour la priorité d'une tâche
    console.log(`Updating task ${taskId} priority to ${newPriority}`);
    
    try {
      // Mettre à jour la priorité dans la base de données
      await maintenanceService.updateTaskPriority(taskId, newPriority);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, priority: newPriority } 
            : task
        )
      );
      
      toast.success(`Priorité mise à jour: ${newPriority}`);
    } catch (error: any) {
      console.error('Error updating task priority:', error);
      toast.error('Impossible de mettre à jour la priorité: ' + error.message);
    }
  };

  const deleteTask = async (taskId: number) => {
    // Supprimer une tâche
    console.info('Deleting task with ID:', taskId);
    
    try {
      // Supprimer la tâche dans la base de données
      await maintenanceService.deleteTask(taskId);
      
      // Utiliser un setTimeout pour laisser le temps aux dialogues de se fermer
      setTimeout(() => {
        // Mettre à jour l'état local
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
        toast.success('Tâche supprimée avec succès');
      }, 200);
      
      return true;
    } catch (error: any) {
      console.error('Error deleting task:', error);
      toast.error('Impossible de supprimer la tâche: ' + error.message);
      throw error;
    }
  };

  const refreshTasks = useCallback(async () => {
    console.log('Refreshing maintenance tasks...');
    setIsLoading(true);
    
    try {
      const refreshedTasks = await maintenanceService.getTasks();
      setTasks(refreshedTasks);
      console.log('Tasks refreshed successfully:', refreshedTasks);
    } catch (error: any) {
      console.error('Error refreshing tasks:', error);
      toast.error('Erreur lors du rafraîchissement des tâches');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { 
    tasks, 
    isLoading, 
    error,
    addTask, 
    updateTaskStatus, 
    updateTaskPriority,
    deleteTask,
    refreshTasks,
    currentUser
  };
}
