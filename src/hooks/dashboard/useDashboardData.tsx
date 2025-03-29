
import { useState, useEffect } from 'react';
import { equipmentService } from '@/services/supabase/equipmentService';
import { maintenanceService } from '@/services/supabase/maintenanceService';
import { getParts } from '@/services/supabase/parts';
import { interventionService } from '@/services/supabase/interventionService';
import { Part } from '@/types/Part';
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Intervention } from '@/types/Intervention';
import { Tractor, Wrench, Package, ClipboardCheck } from 'lucide-react';

// Stat type definition
export interface Stat {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

// Equipment data type
export interface EquipmentItem {
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

// Maintenance event type
export interface MaintenanceEvent {
  id: string;
  title: string;
  date: Date;
  duration: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  equipment: string;
}

// Alert item type
export interface AlertItem {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  equipment: string;
}

// Task item type
export interface TaskItem {
  id: number;
  title: string;
  equipment: string;
  due: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | string;
  assignee: string;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<Stat[]>([]);
  const [equipmentData, setEquipmentData] = useState<EquipmentItem[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<MaintenanceEvent[]>([]);
  const [alertItems, setAlertItems] = useState<AlertItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<TaskItem[]>([]);

  // Helper for date formatting
  const getDueString = (date: Date): string => {
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
  const updateStatsData = (
    equipment: any[], 
    maintenanceTasks: MaintenanceTask[], 
    parts: Part[], 
    interventions: Intervention[]
  ) => {
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
    setStatsData([
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
    ]);
  };

  // Transform equipment data
  const updateEquipmentData = (equipment: any[], maintenanceTasks: MaintenanceTask[]) => {
    const formattedEquipment = equipment.slice(0, 3).map(item => {
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

    setEquipmentData(formattedEquipment);
  };

  // Transform maintenance events
  const updateMaintenanceEvents = (maintenanceTasks: MaintenanceTask[]) => {
    const events = maintenanceTasks.slice(0, 5).map(task => ({
      id: task.id.toString(),
      title: task.title,
      date: task.dueDate,
      duration: task.estimatedDuration || 2,
      priority: task.priority,
      equipment: task.equipment
    }));

    setMaintenanceEvents(events);
  };

  // Transform alerts
  const updateAlerts = (equipment: any[], parts: Part[], maintenanceTasks: MaintenanceTask[]) => {
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
    
    setAlertItems(alerts.slice(0, 3));
  };

  // Transform upcoming tasks
  const updateUpcomingTasks = (maintenanceTasks: MaintenanceTask[]) => {
    const today = new Date();
    const filteredTasks = maintenanceTasks.filter(task => 
      task.status !== 'completed' && 
      task.dueDate >= today
    ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 3);
    
    const mappedTasks = filteredTasks.map(task => ({
      id: task.id,
      title: task.title,
      equipment: task.equipment,
      due: getDueString(task.dueDate),
      priority: task.priority,
      assignee: task.assignedTo || 'Unassigned'
    }));
    
    setUpcomingTasks(mappedTasks);
  };

  // Load all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Get equipment
      const equipment = await equipmentService.getEquipment();
      
      // 2. Get maintenance tasks
      const maintenanceTasks = await maintenanceService.getTasks();
      
      // 3. Get parts
      const parts = await getParts();
      
      // 4. Get interventions
      const interventions = await interventionService.getInterventions();
      
      // Update all data sections
      updateStatsData(equipment, maintenanceTasks, parts, interventions);
      updateEquipmentData(equipment, maintenanceTasks);
      updateMaintenanceEvents(maintenanceTasks);
      updateAlerts(equipment, parts, maintenanceTasks);
      updateUpcomingTasks(maintenanceTasks);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  return {
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    fetchDashboardData
  };
};
