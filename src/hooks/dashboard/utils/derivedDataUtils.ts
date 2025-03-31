
import { normalizePriority } from './calendarUtils';
import { MaintenanceEvent, UrgentIntervention, StockAlert, CalendarEvent } from '../types/dashboardTypes';

/**
 * Derive urgent interventions from interventions data
 */
export const deriveUrgentInterventions = (interventions: any[]): UrgentIntervention[] => {
  return interventions
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
};

/**
 * Derive stock alerts from parts data
 */
export const deriveStockAlerts = (parts: any[]): StockAlert[] => {
  console.log("Deriving stock alerts from parts data:", parts);
  
  // Filter parts with low stock
  const lowStockParts = parts.filter(item => {
    // Ensure we're working with numbers for comparison
    const stock = typeof item.quantity === 'number' ? item.quantity : 
                (typeof item.stock === 'number' ? item.stock : 0);
                
    const reorderPoint = typeof item.reorder_threshold === 'number' ? item.reorder_threshold : 
                       (typeof item.reorderPoint === 'number' ? item.reorderPoint : 5);
                       
    console.log(`Part ${item.id} - ${item.name}: stock=${stock}, reorderPoint=${reorderPoint}, isLow=${stock <= reorderPoint}`);
    return stock <= reorderPoint;
  });
  
  console.log(`Found ${lowStockParts.length} parts with low stock`);
  
  // Map to StockAlert objects
  return lowStockParts.map(item => {
    const stock = typeof item.quantity === 'number' ? item.quantity : 
                (typeof item.stock === 'number' ? item.stock : 0);
                
    const reorderPoint = typeof item.reorder_threshold === 'number' ? item.reorder_threshold : 
                       (typeof item.reorderPoint === 'number' ? item.reorderPoint : 5);
                       
    // Calculate percent remaining (capped at 100%)
    const percentRemaining = reorderPoint > 0 
                           ? Math.min(Math.round((stock / reorderPoint) * 100), 100) 
                           : 0;
    
    return {
      id: typeof item.id === 'string' ? parseInt(item.id) : item.id,
      name: item.name,
      currentStock: stock,
      reorderPoint: reorderPoint,
      percentRemaining: percentRemaining,
      category: item.category || 'Non catégorisé'
    };
  });
};

/**
 * Create calendar events combining maintenance, interventions, and tasks
 */
export const createCalendarEvents = (
  maintenanceEvents: MaintenanceEvent[], 
  interventions: any[], 
  upcomingTasks: any[]
): CalendarEvent[] => {
  console.log("Creating calendar events from:", { 
    maintenanceEvents, 
    interventionsCount: interventions.length, 
    tasksCount: upcomingTasks.length 
  });
  
  return [
    ...maintenanceEvents.map(event => ({
      id: event.id,
      title: event.title,
      start: event.date,
      end: new Date(event.date.getTime() + (event.duration * 60 * 60 * 1000)),
      type: 'maintenance' as const,
      priority: event.priority,
      status: event.status,
      assignedTo: event.assignedTo
    })),
    ...interventions.map(item => ({
      id: item.id,
      title: item.title,
      start: new Date(item.date),
      end: new Date(new Date(item.date).getTime() + ((item.duration || 1) * 60 * 60 * 1000)),
      type: 'intervention' as const,
      priority: normalizePriority(item.priority),
      status: item.status,
      assignedTo: item.technician || 'Non assigné'
    })),
    ...upcomingTasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.dueDate,
      end: new Date(task.dueDate.getTime() + (3 * 60 * 60 * 1000)), // Assuming 3 hours for tasks
      type: 'task' as const,
      priority: normalizePriority(task.priority),
      status: task.status,
      assignedTo: task.assignedTo || 'Non assigné'
    }))
  ];
};
