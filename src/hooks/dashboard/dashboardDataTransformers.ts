
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Part } from '@/types/Part';
import { Intervention } from '@/types/Intervention';
import { Tractor, Wrench, Package, ClipboardCheck } from 'lucide-react';
import { Stat, EquipmentItem, MaintenanceEvent, AlertItem, TaskItem } from './types';

// Helper for date formatting
export const getDueString = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const taskDate = new Date(date);
  taskDate.setHours(0, 0, 0, 0);
  
  if (taskDate.getTime() === today.getTime()) return 'Today';
  if (taskDate.getTime() === tomorrow.getTime()) return 'Tomorrow';
  
  if (taskDate < today) return 'Overdue';
  
  return `${date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}`;
};

// Transform stats data
export const transformStatsData = (
  equipment: any[], 
  maintenanceTasks: MaintenanceTask[], 
  parts: Part[], 
  interventions: Intervention[]
): Stat[] => {
  // 1. Active equipment count
  const operationalEquipment = equipment.filter(item => item.status === 'operational').length;
  
  // 2. Pending maintenance tasks
  const pendingMaintenance = maintenanceTasks.filter(task => 
    task.status !== 'completed' && task.status !== 'cancelled'
  ).length;
  
  // 3. Low stock parts count
  const lowStockParts = parts.filter(part => 
    part.stock <= (part.reorderPoint || 5)
  ).length;
  
  // 4. This week's interventions
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  
  const weeklyInterventions = interventions.filter(intervention => {
    const date = new Date(intervention.date);
    return date >= weekStart && date < weekEnd;
  }).length;

  // Build stats array
  return [
    {
      title: 'Active Equipment',
      value: operationalEquipment.toString(),
      icon: <Tractor className="text-primary h-5 w-5" />,
      trend: {
        value: 4,
        isPositive: true
      }
    }, 
    {
      title: 'Maintenance Tasks',
      value: pendingMaintenance.toString(),
      icon: <Wrench className="text-primary h-5 w-5" />,
      description: `${maintenanceTasks.filter(task => task.priority === 'high' && task.status !== 'completed').length} high priority`,
      trend: {
        value: 2,
        isPositive: false
      }
    }, 
    {
      title: 'Parts Inventory',
      value: parts.length.toString(),
      icon: <Package className="text-primary h-5 w-5" />,
      description: `${lowStockParts} items low stock`,
      trend: {
        value: 12,
        isPositive: true
      }
    }, 
    {
      title: 'Field Interventions',
      value: weeklyInterventions.toString(),
      icon: <ClipboardCheck className="text-primary h-5 w-5" />,
      description: 'This week',
      trend: {
        value: 15,
        isPositive: true
      }
    }
  ];
};

// Transform equipment data
export const transformEquipmentData = (equipment: any[], maintenanceTasks: MaintenanceTask[]): EquipmentItem[] => {
  return equipment.slice(0, 3).map(item => {
    // Find next maintenance for this equipment
    const nextMaintenance = maintenanceTasks
      .filter(task => task.equipmentId === item.id && task.status !== 'completed')
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
    
    return {
      id: item.id,
      name: item.name,
      type: item.type || 'Unknown',
      image: item.image || 'https://images.unsplash.com/photo-1585911171167-1f66ea3de00c?q=80&w=500&auto=format&fit=crop',
      status: item.status || 'operational',
      usage: {
        hours: item.hours || 342,
        target: 500
      },
      nextService: nextMaintenance ? {
        type: nextMaintenance.type,
        due: getDueString(nextMaintenance.dueDate)
      } : {
        type: 'No maintenance scheduled',
        due: 'N/A'
      }
    };
  });
};

// Transform maintenance events
export const transformMaintenanceEvents = (maintenanceTasks: MaintenanceTask[]): MaintenanceEvent[] => {
  return maintenanceTasks.slice(0, 5).map(task => ({
    id: task.id.toString(),
    title: task.title,
    date: task.dueDate,
    duration: task.estimatedDuration || 2,
    priority: task.priority,
    equipment: task.equipment
  }));
};

// Transform alerts
export const transformAlerts = (equipment: any[], parts: Part[], maintenanceTasks: MaintenanceTask[]): AlertItem[] => {
  const alerts = [];
  
  // Equipment repair alerts
  equipment.filter(item => item.status === 'repair').forEach(item => {
    alerts.push({
      id: `eq-${item.id}`,
      severity: 'high',
      message: `${item.name} requires repair`,
      time: '24 hours ago',
      equipment: item.name
    });
  });
  
  // Low stock alerts
  parts.filter(part => part.stock <= (part.reorderPoint || 5)).slice(0, 2).forEach(part => {
    alerts.push({
      id: `part-${part.id}`,
      severity: 'medium',
      message: `Low stock alert: ${part.name}`,
      time: '48 hours ago',
      equipment: 'Inventory'
    });
  });
  
  // Overdue maintenance alerts
  const today = new Date();
  maintenanceTasks.filter(task => 
    task.status !== 'completed' && 
    task.dueDate < today
  ).slice(0, 2).forEach(task => {
    alerts.push({
      id: `maint-${task.id}`,
      severity: 'low',
      message: `Overdue maintenance: ${task.title}`,
      time: '72 hours ago',
      equipment: task.equipment
    });
  });
  
  return alerts.slice(0, 3);
};

// Transform upcoming tasks
export const transformUpcomingTasks = (maintenanceTasks: MaintenanceTask[]): TaskItem[] => {
  const today = new Date();
  const filteredTasks = maintenanceTasks.filter(task => 
    task.status !== 'completed' && 
    task.dueDate >= today
  ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 3);
  
  return filteredTasks.map(task => ({
    id: task.id,
    title: task.title,
    equipment: task.equipment,
    due: getDueString(task.dueDate),
    priority: task.priority,
    assignee: task.assignedTo || 'Unassigned'
  }));
};
