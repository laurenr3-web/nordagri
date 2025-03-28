
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaintenanceTask, MaintenanceFormValues, MaintenancePriority, MaintenanceStatus } from '@/hooks/maintenance/maintenanceSlice';
import { useToast } from '@/hooks/use-toast';
import { maintenanceService } from '@/services/supabase/maintenanceService';

export const useTasksManager = (initialTasks: MaintenanceTask[] = []) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);

  // Fetch tasks from Supabase
  const { data: supabaseTasks, isLoading, isError } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => maintenanceService.getTasks(),
    meta: {
      onSuccess: (data: MaintenanceTask[]) => {
        console.log('Successfully fetched maintenance tasks:', data);
        if (data && data.length > 0) {
          setTasks(data);
        } else if (initialTasks.length > 0) {
          // If Supabase has no data but we have initial data, we could seed it
          console.log('No tasks in Supabase, using initial data');
          setTasks(initialTasks);
        }
      },
      onError: (error: Error) => {
        console.error('Error fetching tasks:', error);
        if (initialTasks.length > 0) {
          console.log('Error occurred when fetching from Supabase, using initial data');
          setTasks(initialTasks);
        }
      }
    }
  });

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: (formData: MaintenanceFormValues) => {
      const newTask: Omit<MaintenanceTask, 'id'> = {
        ...formData,
        status: 'scheduled' as MaintenanceStatus,
      };
      return maintenanceService.addTask(newTask);
    },
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      toast({
        title: "Tâche créée",
        description: `La tâche de maintenance "${newTask.title}" a été créée avec succès`,
      });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la tâche de maintenance",
        variant: "destructive",
      });
    }
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number, status: MaintenanceStatus }) => 
      maintenanceService.updateTaskStatus(taskId.toString(), status),
    onSuccess: (_, { taskId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { 
          ...task, 
          status,
          ...(status === 'completed' ? { completedDate: new Date() } : {})
        } : task
      ));
      
      toast({
        title: "Tâche mise à jour",
        description: `Le statut de la tâche a été mis à jour à ${status}`,
      });
    },
    onError: (error) => {
      console.error('Error updating task status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la tâche",
        variant: "destructive",
      });
    }
  });

  // Update task priority mutation
  const updateTaskPriorityMutation = useMutation({
    mutationFn: ({ taskId, priority }: { taskId: number, priority: MaintenancePriority }) => 
      maintenanceService.updateTaskPriority(taskId.toString(), priority),
    onSuccess: (_, { taskId, priority }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(prevTasks => prevTasks.map(task => 
        task.id === taskId ? { ...task, priority } : task
      ));
      
      toast({
        title: "Tâche mise à jour",
        description: `La priorité de la tâche a été mise à jour à ${priority}`,
      });
    },
    onError: (error) => {
      console.error('Error updating task priority:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la priorité de la tâche",
        variant: "destructive",
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => maintenanceService.deleteTask(taskId.toString()),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Tâche supprimée",
        description: "La tâche de maintenance a été supprimée",
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la tâche",
        variant: "destructive",
      });
    }
  });

  // Use effect to update tasks when supabaseTasks changes
  useEffect(() => {
    if (supabaseTasks && supabaseTasks.length > 0) {
      setTasks(supabaseTasks);
      console.log('Updated tasks state with Supabase data:', supabaseTasks);
    }
  }, [supabaseTasks]);

  // Function to add a task
  const addTask = (formData: MaintenanceFormValues) => {
    console.log('Adding task:', formData);
    addTaskMutation.mutate(formData);
    // Return task with temp ID for optimistic UI updates
    return { id: Date.now(), ...formData, status: 'scheduled' as MaintenanceStatus };
  };

  // Function to update task status
  const updateTaskStatus = (taskId: number, status: MaintenanceStatus) => {
    console.log('Updating task status:', taskId, status);
    updateTaskStatusMutation.mutate({ taskId, status });
  };

  // Function to update task priority
  const updateTaskPriority = (taskId: number, priority: MaintenancePriority) => {
    console.log('Updating task priority:', taskId, priority);
    updateTaskPriorityMutation.mutate({ taskId, priority });
  };

  // Function to delete a task
  const deleteTask = (taskId: number) => {
    console.log('Deleting task:', taskId);
    deleteTaskMutation.mutate(taskId);
  };

  return {
    tasks: supabaseTasks || tasks,
    setTasks,
    isLoading,
    isError,
    addTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  };
};
