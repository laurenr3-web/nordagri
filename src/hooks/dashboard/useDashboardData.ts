
import { useState, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { toast } from "@/hooks/use-toast";
import { CalendarEvent } from './types/dashboardTypes';

// Import specialized hooks
import { useStatsData } from './useStatsData';
import { useEquipmentData } from './useEquipmentData';
import { useMaintenanceData } from './useMaintenanceData';
import { useAlertsData } from './useAlertsData';
import { useTasksData } from './useTasksData';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { usePartsData } from '@/hooks/parts/usePartsData';

// Import utility functions
import { filterWeeklyCalendarEvents } from './utils/calendarUtils';

// Export types from the types file
export * from './types/dashboardTypes';

// Utility function to create calendar events
const createCalendarEvents = (
  maintenanceEvents: any[],
  interventions: any[],
  tasks: any[]
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Add maintenance events
  maintenanceEvents.forEach(event => {
    events.push({
      id: event.id,
      title: event.title,
      date: event.date,
      start: event.date, // Set start to date for compatibility
      type: 'maintenance',
      equipment: event.equipment,
      status: event.status,
      priority: event.priority
    });
  });

  // Add intervention events
  interventions.forEach(intervention => {
    events.push({
      id: `intervention-${intervention.id}`,
      title: intervention.title,
      date: intervention.date || new Date(),
      start: intervention.date || new Date(), // Set start to date for compatibility
      type: 'intervention',
      equipment: intervention.equipment,
      status: intervention.status,
      priority: intervention.priority
    });
  });

  // Add task events
  tasks.forEach(task => {
    events.push({
      id: `task-${task.id}`,
      title: task.title,
      date: task.dueDate || new Date(),
      start: task.dueDate || new Date(), // Set start to date for compatibility
      type: 'task',
      equipment: task.equipment || 'N/A',
      status: task.status,
      priority: task.priority
    });
  });

  return events;
};

// Function to derive urgent interventions
const deriveUrgentInterventions = (interventions: any[]) => {
  return interventions
    .filter(intervention => 
      intervention.priority && 
      (intervention.priority.toLowerCase() === 'high' || 
       intervention.priority.toLowerCase() === 'critical') &&
      intervention.status !== 'completed'
    )
    .sort((a, b) => {
      // Sort by date (most recent first)
      const dateA = a.date ? new Date(a.date) : new Date();
      const dateB = b.date ? new Date(b.date) : new Date();
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Get the top 5
};

// Function to derive stock alerts
const deriveStockAlerts = (parts: any[]) => {
  return parts
    .filter(part => {
      // Filter parts with low stock
      const currentStock = part.stock || 0;
      const reorderPoint = part.reorderPoint || 10;
      return currentStock <= reorderPoint;
    })
    .map(part => {
      // Calculate percentage remaining
      const currentStock = part.stock || 0;
      const reorderPoint = part.reorderPoint || 10;
      // We consider 100% to be at or above reorder point, 0% to be empty
      const percentRemaining = Math.min(100, Math.max(0, (currentStock / reorderPoint) * 100));
      
      return {
        id: part.id,
        name: part.name,
        currentStock: currentStock,
        reorderPoint: reorderPoint,
        percentRemaining: percentRemaining,
        category: part.category || 'Parts'
      };
    })
    .sort((a, b) => a.percentRemaining - b.percentRemaining); // Sort by lowest percentage first
};

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
  const urgentInterventions = deriveUrgentInterventions(interventions);

  // Derive stock alerts from parts data
  const stockAlerts = deriveStockAlerts(parts);

  // Create calendar events combining maintenance, interventions, and tasks
  const calendarEvents = createCalendarEvents(
    maintenanceEvents,
    interventions,
    upcomingTasks
  );

  // Filter calendar events to show only this week's events
  const weeklyCalendarEvents = filterWeeklyCalendarEvents(calendarEvents);

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
