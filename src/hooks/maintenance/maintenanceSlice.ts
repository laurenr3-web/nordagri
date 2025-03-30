
import { useState } from 'react';
import { useTasksManager } from './useTasksManager';

export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'canceled' | 'pending-parts';
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
  partId?: string;
}

export const useMaintenanceSlice = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const { 
    tasks, 
    isLoading, 
    addTask, 
    updateTaskStatus, 
    updateTaskPriority, 
    deleteTask 
  } = useTasksManager();

  const handleAddTask = (formData: MaintenanceFormValues) => {
    // Prepare task data with required status field
    const taskData: Omit<MaintenanceTask, 'id'> = {
      ...formData,
      status: 'scheduled',
    };
    
    const newTask = addTask(taskData);
    return newTask;
  };

  return {
    tasks,
    isLoading,
    isNewTaskDialogOpen,
    setIsNewTaskDialogOpen,
    handleAddTask,
    updateTaskStatus,
    updateTaskPriority,
    deleteTask
  };
};
