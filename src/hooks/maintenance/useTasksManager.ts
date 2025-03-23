
import { useState } from 'react';
import { MaintenanceTask, MaintenanceFormValues } from '@/hooks/maintenance/maintenanceSlice';
import { useToast } from '@/hooks/use-toast';

export const useTasksManager = (initialTasks: MaintenanceTask[]) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);

  const addTask = (formData: MaintenanceFormValues) => {
    const newTask: MaintenanceTask = {
      id: tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1,
      ...formData,
      status: 'scheduled',
    };
    
    setTasks([...tasks, newTask]);
    
    toast({
      title: "Task created",
      description: `Maintenance task "${formData.title}" has been created successfully`,
    });
    
    return newTask;
  };
  
  const updateTaskStatus = (taskId: number, status: MaintenanceTask['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
    
    toast({
      title: "Task updated",
      description: `Task status has been updated to ${status}`,
    });
  };
  
  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    toast({
      title: "Task deleted",
      description: "The maintenance task has been removed",
    });
  };

  return {
    tasks,
    setTasks,
    addTask,
    updateTaskStatus,
    deleteTask
  };
};
