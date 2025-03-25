
import { useState } from 'react';
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
    onSuccess: (data) => {
      if (data.length > 0) {
        setTasks(data);
      } else if (initialTasks.length > 0 && data.length === 0) {
        // If Supabase has no data but we have initial data, we could seed it
        // This is optional and depends on your requirements
        console.log('No tasks in Supabase, using initial data');
        setTasks(initialTasks);
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
      setTasks([...tasks, newTask]);
      
      toast({
        title: "Task created",
        description: `Maintenance task "${newTask.title}" has been created successfully`,
      });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add maintenance task",
        variant: "destructive",
      });
    }
  });

  // Update task status mutation
  const updateTaskStatusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: number, status: MaintenanceStatus }) => 
      maintenanceService.updateTaskStatus(taskId, status),
    onSuccess: (_, { taskId, status }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(tasks.map(task => 
        task.id === taskId ? { 
          ...task, 
          status,
          ...(status === 'completed' ? { completedDate: new Date() } : {})
        } : task
      ));
      
      toast({
        title: "Task updated",
        description: `Task status has been updated to ${status}`,
      });
    },
    onError: (error) => {
      console.error('Error updating task status:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  });

  // Update task priority mutation
  const updateTaskPriorityMutation = useMutation({
    mutationFn: ({ taskId, priority }: { taskId: number, priority: MaintenancePriority }) => 
      maintenanceService.updateTaskPriority(taskId, priority),
    onSuccess: (_, { taskId, priority }) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, priority } : task
      ));
      
      toast({
        title: "Task updated",
        description: `Task priority has been updated to ${priority}`,
      });
    },
    onError: (error) => {
      console.error('Error updating task priority:', error);
      toast({
        title: "Error",
        description: "Failed to update task priority",
        variant: "destructive",
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: number) => maintenanceService.deleteTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Task deleted",
        description: "The maintenance task has been removed",
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  });

  // Function to add a task
  const addTask = (formData: MaintenanceFormValues) => {
    addTaskMutation.mutate(formData);
    return { id: 0, ...formData, status: 'scheduled' as MaintenanceStatus };
  };

  // Function to update task status
  const updateTaskStatus = (taskId: number, status: MaintenanceStatus) => {
    updateTaskStatusMutation.mutate({ taskId, status });
  };

  // Function to update task priority
  const updateTaskPriority = (taskId: number, priority: MaintenancePriority) => {
    updateTaskPriorityMutation.mutate({ taskId, priority });
  };

  // Function to delete a task
  const deleteTask = (taskId: number) => {
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
