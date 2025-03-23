
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'pending-parts';
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
  const { toast } = useToast();
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);

  const handleAddTask = (formData: MaintenanceFormValues) => {
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

  return {
    tasks,
    setTasks,
    isNewTaskDialogOpen,
    setIsNewTaskDialogOpen,
    handleAddTask,
  };
};
