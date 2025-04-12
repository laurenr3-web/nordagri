
import { CalendarEvent, StockAlert } from '../types/dashboardTypes';

/**
 * Creates calendar events from maintenance events, interventions, and tasks
 */
export const createCalendarEvents = (
  maintenanceEvents: any[],
  interventions: any[],
  tasks: any[]
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  // Add maintenance events
  maintenanceEvents.forEach(event => {
    const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
    events.push({
      id: event.id,
      title: event.title,
      date: eventDate,
      start: eventDate, // Set start equal to date for compatibility
      type: 'maintenance',
      equipment: event.equipment,
      status: event.status,
      priority: event.priority
    });
  });

  // Add intervention events
  interventions.forEach(intervention => {
    const eventDate = intervention.date instanceof Date ? 
      intervention.date : 
      (intervention.date ? new Date(intervention.date) : new Date());
    
    events.push({
      id: `intervention-${intervention.id}`,
      title: intervention.title,
      date: eventDate,
      start: eventDate, // Set start equal to date for compatibility
      type: 'intervention',
      equipment: intervention.equipment,
      status: intervention.status,
      priority: intervention.priority
    });
  });

  // Add task events
  tasks.forEach(task => {
    const eventDate = task.dueDate instanceof Date ?
      task.dueDate :
      (task.dueDate ? new Date(task.dueDate) : new Date());
    
    events.push({
      id: `task-${task.id}`,
      title: task.title,
      date: eventDate,
      start: eventDate, // Set start equal to date for compatibility
      type: 'task',
      equipment: task.equipment || 'N/A',
      status: task.status,
      priority: task.priority
    });
  });

  return events;
};

/**
 * Derive urgent interventions from interventions data
 */
export const deriveUrgentInterventions = (interventions: any[]) => {
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

/**
 * Derive stock alerts from parts data
 */
export const deriveStockAlerts = (parts: any[]): StockAlert[] => {
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
