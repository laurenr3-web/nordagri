
import React from 'react';
import { format, isToday, isPast, isFuture } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { MaintenanceTask, MaintenanceStatus, MaintenancePriority } from '@/hooks/maintenance/maintenanceSlice';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

/**
 * Formats a date to a human-readable string
 */
export const formatDate = (date: Date): string => {
  return format(date, 'dd MMM yyyy', { locale: fr });
};

/**
 * Returns a badge component for the given task status
 */
export const getStatusBadge = (status: MaintenanceStatus) => {
  switch (status) {
    case 'completed':
      return (
        <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          <span>Terminé</span>
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge variant="info" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>En cours</span>
        </Badge>
      );
    case 'scheduled':
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Planifié</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <span>{status}</span>
        </Badge>
      );
  }
};

/**
 * Returns a badge component for the given task priority
 */
export const getPriorityBadge = (priority: MaintenancePriority) => {
  switch (priority) {
    case 'critical':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Critique</span>
        </Badge>
      );
    case 'high':
      return <Badge variant="warning">Haute</Badge>;
    case 'medium':
      return <Badge variant="secondary">Moyenne</Badge>;
    case 'low':
      return <Badge variant="outline">Basse</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

/**
 * Get upcoming tasks (not completed, due in the future)
 */
export const getUpcomingTasks = (tasks: MaintenanceTask[]): MaintenanceTask[] => {
  return tasks.filter(task => 
    task.status !== 'completed' && isFuture(task.dueDate) && !isToday(task.dueDate)
  );
};

/**
 * Get active tasks (not completed, due today or in-progress)
 */
export const getActiveTasks = (tasks: MaintenanceTask[]): MaintenanceTask[] => {
  return tasks.filter(task => 
    task.status !== 'completed' && 
    (isToday(task.dueDate) || task.status === 'in-progress')
  );
};

/**
 * Get completed tasks
 */
export const getCompletedTasks = (tasks: MaintenanceTask[]): MaintenanceTask[] => {
  return tasks.filter(task => task.status === 'completed');
};

/**
 * Get overdue tasks (not completed, past due date)
 */
export const getOverdueTasks = (tasks: MaintenanceTask[]): MaintenanceTask[] => {
  return tasks.filter(task => 
    task.status !== 'completed' && isPast(task.dueDate) && !isToday(task.dueDate)
  );
};
