
import { useState } from 'react';
import { useTasksManager } from './useTasksManager';

export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'pending-parts' | 'cancelled';
export type MaintenancePriority = 'critical' | 'high' | 'medium' | 'low';
export type MaintenanceType = 'preventive' | 'corrective' | 'condition-based';

export interface MaintenanceTask {
  id: number;
  title: string;
  equipment: string;
  equipmentId: number;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  dueDate: Date;
  completedDate?: Date;
  estimatedDuration: number;
  actualDuration?: number;
  assignedTo: string;
  notes: string;
}

export interface MaintenanceFormValues {
  title: string;
  equipment: string;
  equipmentId: number;
  type: MaintenanceType;
  priority: MaintenancePriority;
  dueDate: Date;
  estimatedDuration: number;
  assignedTo: string;
  notes: string;
}

export const useMaintenanceSlice = (initialTasks: MaintenanceTask[]) => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { 
    tasks, 
    setTasks, 
    addTask, 
    updateTaskStatus, 
    updateTaskPriority, 
    deleteTask 
  } = useTasksManager(initialTasks);

  const handleAddTask = (formData: MaintenanceFormValues) => {
    const newTask = addTask(formData);
    return newTask;
  };

  return {
    tasks,
    setTasks,
    isNewTaskDialogOpen,
    setIsNewTaskDialogOpen,
    handleAddTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  };
};
