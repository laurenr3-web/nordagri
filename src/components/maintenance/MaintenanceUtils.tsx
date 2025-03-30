
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle2, Clock, AlertTriangle, XCircle, User } from 'lucide-react';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';

// Helper function to format date
export const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function for status badge
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'scheduled':
      return (
        <Badge variant="outline" className="bg-secondary flex items-center gap-1 text-muted-foreground">
          <Calendar size={12} />
          <span>Scheduled</span>
        </Badge>
      );
    case 'in-progress':
      return (
        <Badge className="bg-harvest-100 text-harvest-800 flex items-center gap-1">
          <Clock size={12} />
          <span>In Progress</span>
        </Badge>
      );
    case 'completed':
      return (
        <Badge className="bg-agri-100 text-agri-800 flex items-center gap-1">
          <CheckCircle2 size={12} />
          <span>Completed</span>
        </Badge>
      );
    case 'pending-parts':
      return (
        <Badge variant="outline" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <AlertTriangle size={12} />
          <span>Pending Parts</span>
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle size={12} />
          <span>Cancelled</span>
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-secondary text-muted-foreground">
          {status}
        </Badge>
      );
  }
};

// Helper function for priority badge
export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'critical':
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle size={12} />
          <span>Critical</span>
        </Badge>
      );
    case 'high':
      return (
        <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
          <AlertTriangle size={12} />
          <span>High</span>
        </Badge>
      );
    case 'medium':
      return (
        <Badge className="bg-harvest-100 text-harvest-800">Medium</Badge>
      );
    case 'low':
      return (
        <Badge className="bg-agri-100 text-agri-800">Low</Badge>
      );
    default:
      return (
        <Badge variant="outline">{priority}</Badge>
      );
  }
};

// Helper function to get priority color
export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper functions for task filtering
export const getUpcomingTasks = (tasks: MaintenanceTask[]) => {
  return tasks.filter(task => 
    task.status === 'scheduled' || task.status === 'pending-parts'
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

export const getActiveTasks = (tasks: MaintenanceTask[]) => {
  return tasks.filter(task => task.status === 'in-progress')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
};

export const getCompletedTasks = (tasks: MaintenanceTask[]) => {
  return tasks.filter(task => task.status === 'completed')
    .sort((a, b) => (b.completedDate?.getTime() || 0) - (a.completedDate?.getTime() || 0));
};
