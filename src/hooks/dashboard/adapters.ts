
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
    trend: {
      value: Math.abs(stat.change),
      isPositive: stat.change >= 0
    }
  }));
};

export const adaptEquipmentData = (equipmentData: EquipmentItem[]) => {
  return equipmentData.map(item => ({
    id: item.id,
    name: item.name,
    type: item.type,
    image: `https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop`,
    status: item.status as 'operational' | 'maintenance' | 'repair',
    usage: {
      hours: Math.floor(Math.random() * 500),
      target: 500
    },
    nextService: {
      type: 'Maintenance Check',
      due: item.nextMaintenance || 'Not scheduled'
    }
  }));
};

export const adaptMaintenanceEvents = (maintenanceEvents: MaintenanceEvent[]) => {
  return maintenanceEvents.map((event, index) => ({
    id: event.id.toString(),
    title: event.title,
    date: event.date,
    duration: Math.floor(Math.random() * 4) + 1,
    priority: (['low', 'medium', 'high'] as const)[Math.floor(Math.random() * 3)],
    equipment: event.equipment
  }));
};

export const adaptAlertItems = (alertItems: AlertItem[]) => {
  return alertItems.map(alert => ({
    id: alert.id,
    severity: alert.type === 'error' ? 'high' as const : 
             alert.type === 'warning' ? 'medium' as const : 'low' as const,
    message: alert.message,
    time: getRelativeTime(alert.date),
    equipment: extractEquipmentName(alert.message)
  }));
};

export const adaptUpcomingTasks = (upcomingTasks: UpcomingTask[]) => {
  return upcomingTasks.map(task => ({
    id: task.id,
    title: task.title,
    equipment: task.equipment,
    due: formatDueDate(task.date),
    priority: task.priority as 'high' | 'medium' | 'low',
    assignee: getRandomAssignee()
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
