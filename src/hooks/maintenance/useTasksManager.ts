
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenancePriority, MaintenanceStatus, MaintenanceType } from './maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';

export function useTasksManager(initialTasks?: MaintenanceTask[]) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(initialTasks ? false : true);
  const [error, setError] = useState<string | null>(null);

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
        
        console.log(`Found ${fetchedTasks.length} maintenance tasks:`, fetchedTasks);
        setTasks(fetchedTasks);
      } catch (error: any) {
        console.error('Error fetching maintenance tasks:', error);
        setError(error.message || "Une erreur est survenue lors de la récupération des tâches");
        toast.error('Impossible de charger les tâches de maintenance');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [initialTasks]);

  const addTask = async (task: Omit<MaintenanceTask, 'id'>) => {
    try {
      // Envoyer la tâche à Supabase
      const newTask = await maintenanceService.addTask(task);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Erreur lors de l'ajout de la tâche");
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: MaintenanceStatus) => {
    try {
      // Mettre à jour dans Supabase
      await maintenanceService.updateTaskStatus(taskId, newStatus);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus,
                completedDate: newStatus === 'completed' ? new Date() : task.completedDate
              } 
            : task
        )
      );
    } catch (error) {
      console.error(`Error updating task ${taskId} status:`, error);
      toast.error("Erreur lors de la mise à jour du statut");
    }
  };

  const updateTaskPriority = async (taskId: number, newPriority: MaintenancePriority) => {
    try {
      // Mettre à jour dans Supabase
      await maintenanceService.updateTaskPriority(taskId, newPriority);
      
      // Mettre à jour l'état local
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, priority: newPriority } 
            : task
        )
      );
    } catch (error) {
      console.error(`Error updating task ${taskId} priority:`, error);
      toast.error("Erreur lors de la mise à jour de la priorité");
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      // Mettre d'abord à jour l'état local pour une réponse immédiate de l'UI
      setTasks(prevTasks => {
        return prevTasks.filter(task => task.id !== taskId);
      });
      
      // Ensuite, persister la suppression dans la base de données
      await maintenanceService.deleteTask(taskId);
      
      toast.success('Tâche supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erreur lors de la suppression de la tâche');
      
      // Recharger les tâches en cas d'erreur pour rétablir l'état correct
      const fetchedTasks = await maintenanceService.getTasks();
      setTasks(fetchedTasks);
      
      throw error;
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await maintenanceService.getTasks();
      setTasks(fetchedTasks);
      setError(null);
    } catch (error: any) {
      console.error('Error refreshing tasks:', error);
      setError(error.message || "Une erreur est survenue lors du rafraîchissement des tâches");
      toast.error('Impossible de rafraîchir les tâches');
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    tasks, 
    isLoading, 
    error,
    addTask, 
    updateTaskStatus, 
    updateTaskPriority,
    deleteTask,
    refreshTasks
  };
}
