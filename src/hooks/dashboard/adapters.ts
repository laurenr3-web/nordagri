import { 
  StatsCardData 
} from './useStatsData';
import { 
  EquipmentItem 
} from './useEquipmentData';
import { 
  MaintenanceEvent 
} from './useMaintenanceData';
import { 
  AlertItem 
} from './useAlertsData';
import { 
  UpcomingTask 
} from './useTasksData';

// Adapter functions to transform data for UI components
export const adaptStatsData = (statsData: StatsCardData[]) => {
  return statsData.map(stat => ({
    title: stat.title,
    value: stat.value.toString(),
    icon: stat.icon,
    description: stat.description,
    trend: stat.change !== undefined ? {
      value: Math.abs(stat.change),
      isPositive: stat.change >= 0
    } : undefined
  }));
};

export const adaptEquipmentData = (equipmentData: EquipmentItem[]) => {
  return equipmentData.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    image: item.image || `https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop`,
    status: item.status,
    usage: item.usage || {
      hours: Math.floor(Math.random() * 500),
      target: 500
    },
    nextService: item.nextService || {
      type: 'Maintenance Check',
      due: 'Not scheduled'
    }
  }));
};

export const adaptMaintenanceEvents = (maintenanceEvents: MaintenanceEvent[]) => {
  return maintenanceEvents.map((event, index) => ({
    id: event.id.toString(),
    title: event.title,
    date: event.date,
    duration: event.duration || Math.floor(Math.random() * 4) + 1,
    priority: event.priority || (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
    equipment: event.equipment
  }));
};

export const adaptAlertItems = (alertItems: AlertItem[]) => {
  return alertItems.map(alert => ({
    id: alert.id,
    severity: alert.severity || (alert.type === 'error' ? 'high' as const : 
              alert.type === 'warning' ? 'medium' as const : 'low' as const),
    message: alert.message,
    time: alert.time || getRelativeTime(alert.date),
    equipment: alert.equipment || extractEquipmentName(alert.message)
  }));
};

export const adaptUpcomingTasks = (upcomingTasks: UpcomingTask[]) => {
  return upcomingTasks.map(task => ({
    id: task.id,
    title: task.title,
    equipment: task.equipment,
    due: task.due || formatDueDate(task.date),
    priority: task.priority as 'high' | 'medium' | 'low',
    assignee: task.assignee || getRandomAssignee()
  }));
};

// Helper functions
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) {
    return `${diffMins} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else {
    return `${diffDays} days ago`;
  }
}

function extractEquipmentName(message: string): string {
  // Try to extract equipment name from message
  if (message.includes('Tractor')) {
    return 'John Deere 8R 410';
  } else if (message.includes('Harvester')) {
    return 'Case IH Axial-Flow';
  } else if (message.includes('Kubota')) {
    return 'Kubota M7-172';
  } else {
    return 'Unknown Equipment';
  }
}

function formatDueDate(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (taskDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

function getRandomAssignee(): string {
  const assignees = ['Michael Torres', 'Sarah Johnson', 'David Chen', 'Emma Garcia', 'James Wilson'];
  return assignees[Math.floor(Math.random() * assignees.length)];
}
