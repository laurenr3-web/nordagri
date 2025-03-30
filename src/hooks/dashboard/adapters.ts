
import { 
  StatsCardData, 
  EquipmentItem, 
  MaintenanceEvent, 
  AlertItem,
  UpcomingTask 
} from './useDashboardData';

// For StatsSection
export interface StatItem {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const adaptStatsData = (data: StatsCardData[]): StatItem[] => {
  return data.map(item => ({
    title: item.title,
    value: item.value.toString(),
    icon: item.icon,
    trend: {
      value: Math.abs(item.change),
      isPositive: item.change > 0
    }
  }));
};

// For AlertsSection & AllAlertsSection
export interface AlertItemForUI {
  id: number;
  severity: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  equipment: string;
}

export const adaptAlertItems = (alerts: AlertItem[]): AlertItemForUI[] => {
  return alerts.map(alert => ({
    id: alert.id,
    severity: mapAlertTypeToSeverity(alert.type),
    message: alert.message,
    time: formatAlertDate(alert.date),
    equipment: alert.action || ''
  }));
};

const mapAlertTypeToSeverity = (type: 'error' | 'warning' | 'info'): 'high' | 'medium' | 'low' => {
  switch (type) {
    case 'error': return 'high';
    case 'warning': return 'medium';
    default: return 'low';
  }
};

const formatAlertDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// For EquipmentSection
export interface EquipmentItemForUI {
  id: number;
  name: string;
  type: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair';
  usage: {
    hours: number;
    target: number;
  };
  nextService: {
    type: string;
    due: string;
  };
}

export const adaptEquipmentData = (equipment: EquipmentItem[]): EquipmentItemForUI[] => {
  return equipment.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop', // Default image
    status: mapEquipmentStatus(item.status),
    usage: {
      hours: 342, // Default values
      target: 500
    },
    nextService: {
      type: item.nextMaintenance || 'Routine Check',
      due: item.nextMaintenance || 'Not scheduled'
    }
  }));
};

const mapEquipmentStatus = (status: string): 'operational' | 'maintenance' | 'repair' => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'operational':
      return 'operational';
    case 'maintenance':
      return 'maintenance';
    case 'repair':
    case 'broken':
      return 'repair';
    default:
      return 'operational';
  }
};

// For MaintenanceSection & CalendarView
export interface MaintenanceEventForUI {
  id: string;
  title: string;
  date: Date;
  duration: number;
  priority: 'low' | 'medium' | 'high';
  equipment: string;
}

export const adaptMaintenanceEvents = (events: MaintenanceEvent[]): MaintenanceEventForUI[] => {
  return events.map(event => ({
    id: event.id.toString(),
    title: event.title,
    date: event.date,
    duration: 2, // Default duration in hours
    priority: mapPriorityFromStatus(event.status),
    equipment: event.equipment
  }));
};

const mapPriorityFromStatus = (status: string): 'low' | 'medium' | 'high' => {
  switch (status.toLowerCase()) {
    case 'critical':
    case 'high':
    case 'overdue':
      return 'high';
    case 'medium':
    case 'scheduled':
      return 'medium';
    default:
      return 'low';
  }
};

// For TasksSection
export interface TaskItemForUI {
  id: number;
  title: string;
  equipment: string;
  due: string;
  priority: 'high' | 'medium' | 'low';
  assignee: string;
}

export const adaptUpcomingTasks = (tasks: UpcomingTask[]): TaskItemForUI[] => {
  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    equipment: task.equipment,
    due: formatTaskDueDate(task.date),
    priority: mapPriorityFromStatus(task.priority),
    assignee: 'Unassigned'
  }));
};

const formatTaskDueDate = (date: Date): string => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === now.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
};
