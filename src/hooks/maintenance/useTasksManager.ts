
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MaintenanceStatus, MaintenancePriority, MaintenanceTask as ModelMaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { adaptServiceTaskToModelTask, adaptModelTaskToServiceTask } from './adapters/maintenanceTypeAdapters';

export function useTasksManager(initialTasks?: ModelMaintenanceTask[]) {
  const [tasks, setTasks] = useState<ModelMaintenanceTask[]>(initialTasks || []);
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
        // Convert service tasks to model tasks
        const modelTasks = fetchedTasks.map((task) => adaptServiceTaskToModelTask(task));
        setTasks(modelTasks);
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

  const addTask = async (task: Omit<ModelMaintenanceTask, 'id'>) => {
    try {
      // Convert model task to service format
      const serviceTask = {
        title: task.title,
        equipment: task.equipment,
        equipment_id: task.equipmentId,
        due_date: task.dueDate.toISOString(),
        status: task.status,
        priority: task.priority,
        type: task.type,
        estimated_duration: task.engineHours,
        assigned_to: task.assignedTo,
        notes: task.notes
      };
      
      // Send task to Supabase
      const newServiceTask = await maintenanceService.addTask(serviceTask);
      
      // Convert back to model format
      const newModelTask = adaptServiceTaskToModelTask(newServiceTask);
      
      // Update local state
      setTasks(prevTasks => [...prevTasks, newModelTask]);
      
      return newModelTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error("Erreur lors de l'ajout de la tâche");
      throw error;
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    try {
      // Update in Supabase
      await maintenanceService.updateTaskStatus(taskId, newStatus);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { 
                ...task, 
                status: newStatus as MaintenanceStatus,
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

  const updateTaskPriority = async (taskId: number, newPriority: string) => {
    try {
      // Update in Supabase
      await maintenanceService.updateTaskPriority(taskId, newPriority);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, priority: newPriority as MaintenancePriority } 
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
      // Update local state first for responsive UI
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Then, persist deletion in database
      await maintenanceService.deleteTask(taskId);
      
      toast.success('Tâche supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Erreur lors de la suppression de la tâche');
      
      // Reload tasks in case of error to restore correct state
      try {
        const fetchedTasks = await maintenanceService.getTasks();
        const modelTasks = fetchedTasks.map((task) => adaptServiceTaskToModelTask(task));
        setTasks(modelTasks);
      } catch (reloadError) {
        console.error("Error reloading tasks after deletion failure:", reloadError);
      }
      
      throw error;
    }
  };

  const refreshTasks = async () => {
    setIsLoading(true);
    try {
      const fetchedTasks = await maintenanceService.getTasks();
      const modelTasks = fetchedTasks.map((task) => adaptServiceTaskToModelTask(task));
      setTasks(modelTasks);
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
