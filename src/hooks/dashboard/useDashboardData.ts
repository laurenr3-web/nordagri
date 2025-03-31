
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";

// Import specialized hooks
import { useStatsData } from './useStatsData';
import { useEquipmentData } from './useEquipmentData';
import { useMaintenanceData } from './useMaintenanceData';
import { useAlertsData } from './useAlertsData';
import { useTasksData } from './useTasksData';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { usePartsData } from '@/hooks/parts/usePartsData';

// Export interfaces with all required properties
export interface StatsCardData {
  title: string;
  value: string | number;
  change?: number;
  status?: 'increase' | 'decrease' | 'neutral';
  icon?: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
}

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'repair' | 'inactive';
  image?: string;
  usage?: {
    hours: number;
    target: number;
  };
  nextService?: {
    type: string;
    due: string;
  };
  nextMaintenance?: string | null;
}

export interface MaintenanceEvent {
  id: string;
  title: string;
  date: Date;
  equipment: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  duration: number;
}

export interface AlertItem {
  id: number;
  title: string;
  message: string;
  severity: 'high' | 'medium' | 'low';
  date: Date;
  equipmentId: number;
  equipmentName: string;
  status: 'new' | 'acknowledged' | 'resolved';
  type: string;
  time: string;
  equipment: string;
}

export interface UrgentIntervention {
  id: number;
  title: string;
  equipment: string;
  priority: 'high' | 'medium' | 'low';
  date: Date;
  status: string;
  technician: string;
  location: string;
}

export interface StockAlert {
  id: number;
  name: string;
  currentStock: number;
  reorderPoint: number;
  percentRemaining: number;
  category: string;
}

export interface UpcomingTask {
  id: string | number;
  title: string;
  description: string;
  dueDate: Date;
  status: string;
  priority: string;
  assignedTo: string;
}

export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  type: 'maintenance' | 'intervention' | 'task';
  priority: 'high' | 'medium' | 'low';
  status: string;
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  // Use specialized hooks
  const { statsData } = useStatsData(user);
  const { equipmentData } = useEquipmentData(user);
  const { maintenanceEvents } = useMaintenanceData(user);
  const { alertItems } = useAlertsData(user);
  const { upcomingTasks } = useTasksData(user);
  
  // New data fetching for additional dashboard features
  const interventionsResult = useInterventionsData();
  const partsResult = usePartsData();
  
  // Get the actual data from the query results
  const interventions = interventionsResult.interventions || [];
  const parts = partsResult.data || [];

  // Derive urgent interventions from interventions data
  const urgentInterventions = interventions
    .filter(item => item.priority === 'high' || item.status === 'in-progress')
    .slice(0, 5)
    .map(item => ({
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      title: item.title,
      equipment: item.equipment,
      priority: item.priority,
      date: new Date(item.date),
      status: item.status,
      technician: item.technician || 'Non assigné',
      location: item.location || 'Inconnu'
    }));

  // Derive stock alerts from parts data
  const stockAlerts = parts
    .filter(item => {
      const stock = typeof item.stock === 'number' ? item.stock : 0;
      const reorderPoint = typeof item.reorderPoint === 'number' ? item.reorderPoint : 5;
      return stock <= reorderPoint;
    })
    .map(item => {
      const stock = typeof item.stock === 'number' ? item.stock : 0;
      const reorderPoint = typeof item.reorderPoint === 'number' ? item.reorderPoint : 5;
      return {
        id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
        name: item.name,
        currentStock: stock,
        reorderPoint: reorderPoint,
        percentRemaining: reorderPoint > 0 ? Math.round((stock / reorderPoint) * 100) : 0,
        category: item.category || 'Non catégorisé'
      };
    });

  // Helper function to normalize priority to one of the allowed values
  const normalizePriority = (priority: string): 'high' | 'medium' | 'low' => {
    switch(priority.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
      default:
        return 'low';
    }
  };

  // Create calendar events combining maintenance, interventions, and tasks
  const calendarEvents: CalendarEvent[] = [
    ...maintenanceEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.date,
      end: new Date(event.date.getTime() + (event.duration * 60 * 60 * 1000)),
      type: 'maintenance' as const,
      priority: event.priority,
      status: event.status
    })),
    ...interventions.map(item => ({
      id: item.id,
      title: item.title,
      start: new Date(item.date),
      end: new Date(new Date(item.date).getTime() + ((item.duration || 1) * 60 * 60 * 1000)),
      type: 'intervention' as const,
      priority: normalizePriority(item.priority),
      status: item.status
    })),
    ...upcomingTasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.dueDate,
      end: new Date(task.dueDate.getTime() + (3 * 60 * 60 * 1000)), // Assuming 3 hours for tasks
      type: 'task' as const,
      priority: normalizePriority(task.priority),
      status: task.status
    }))
  ];

  // Filter calendar events to show only this week's events
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Start from Monday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Sunday
  endOfWeek.setHours(23, 59, 59, 999);

  const weeklyCalendarEvents = calendarEvents.filter(
    event => event.start >= startOfWeek && event.start <= endOfWeek
  ).sort((a, b) => a.start.getTime() - b.start.getTime());

  useEffect(() => {
    const isAllDataLoaded = 
      statsData.length > 0 || 
      equipmentData.length > 0 || 
      maintenanceEvents.length > 0 || 
      alertItems.length > 0 || 
      upcomingTasks.length > 0 ||
      interventions.length > 0 ||
      parts.length > 0;

    if (isAllDataLoaded) {
      setLoading(false);
    }
  }, [statsData, equipmentData, maintenanceEvents, alertItems, upcomingTasks, interventions, parts]);

  useEffect(() => {
    if (!user && !loading) {
      setLoading(false);
    }
  }, [user, loading]);

  return {
    loading,
    statsData,
    equipmentData,
    maintenanceEvents,
    alertItems,
    upcomingTasks,
    urgentInterventions,
    stockAlerts,
    weeklyCalendarEvents
  };
};
