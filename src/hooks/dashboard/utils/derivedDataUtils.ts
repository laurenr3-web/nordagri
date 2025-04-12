
import { Part } from '@/types/Part';
import { StockAlert, UrgentIntervention, CalendarEvent } from '../types/dashboardTypes';

/**
 * Dérive les interventions urgentes à partir des données d'interventions
 */
export const deriveUrgentInterventions = (interventions: any[]): UrgentIntervention[] => {
  if (!interventions || !Array.isArray(interventions)) return [];
  
  // Filtrer les interventions pour ne garder que celles avec une priorité haute ou critique
  // et un statut qui n'est pas "completed" ou "cancelled"
  return interventions
    .filter(intervention => 
      (intervention.priority === 'high' || intervention.priority === 'critical') &&
      intervention.status !== 'completed' &&
      intervention.status !== 'canceled'
    )
    .map(intervention => ({
      id: intervention.id,
      title: intervention.title,
      equipment: intervention.equipment,
      status: intervention.status,
      priority: intervention.priority,
      date: intervention.date instanceof Date ? intervention.date : new Date(intervention.date),
      location: intervention.location,
      assignedTo: intervention.technician || 'Non assigné'
    }))
    .sort((a, b) => {
      // Trier d'abord par priorité (critique avant haute)
      if (a.priority === 'critical' && b.priority !== 'critical') return -1;
      if (a.priority !== 'critical' && b.priority === 'critical') return 1;
      
      // Ensuite par date (plus récent d'abord)
      return a.date.getTime() - b.date.getTime();
    })
    .slice(0, 5); // Limiter à 5 interventions urgentes
};

/**
 * Dérive les alertes de stock à partir des données de pièces
 */
export const deriveStockAlerts = (parts: Part[]): StockAlert[] => {
  if (!parts || !Array.isArray(parts)) return [];

  console.log('Deriving stock alerts from parts:', parts.length);
  
  // Filtrer les pièces pour ne garder que celles avec un stock bas
  return parts
    .filter(part => {
      const inStock = part.stock !== undefined ? part.stock : part.quantity || 0;
      const reorderPoint = part.reorderPoint !== undefined ? part.reorderPoint : part.minimumStock || 10;
      return inStock <= reorderPoint;
    })
    .map(part => {
      const currentStock = part.stock !== undefined ? part.stock : part.quantity || 0;
      const reorderPoint = part.reorderPoint !== undefined ? part.reorderPoint : part.minimumStock || 10;
      const percentRemaining = reorderPoint > 0 ? Math.round((currentStock / reorderPoint) * 100) : 0;
      
      return {
        id: part.id as number,
        name: part.name,
        currentStock,
        reorderPoint,
        percentRemaining,
        category: part.category || 'Pièce'
      };
    })
    .sort((a, b) => a.percentRemaining - b.percentRemaining);
};

/**
 * Crée des événements de calendrier à partir de différentes sources
 */
export const createCalendarEvents = (
  maintenanceEvents: any[],
  interventions: any[],
  tasks: any[]
): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  // Ajouter les événements de maintenance
  if (maintenanceEvents && Array.isArray(maintenanceEvents)) {
    maintenanceEvents.forEach(event => {
      if (event.date instanceof Date || typeof event.date === 'string') {
        events.push({
          id: event.id,
          title: event.title,
          date: event.date instanceof Date ? event.date : new Date(event.date),
          type: 'maintenance' as 'maintenance' | 'intervention' | 'task',
          equipment: event.equipment,
          status: event.status || 'scheduled',
          priority: event.priority || 'medium'
        });
      }
    });
  }
  
  // Ajouter les interventions
  if (interventions && Array.isArray(interventions)) {
    interventions.forEach(intervention => {
      if (intervention.date instanceof Date || typeof intervention.date === 'string') {
        events.push({
          id: intervention.id,
          title: intervention.title,
          date: intervention.date instanceof Date ? intervention.date : new Date(intervention.date),
          type: 'intervention' as 'maintenance' | 'intervention' | 'task',
          equipment: intervention.equipment,
          status: intervention.status || 'scheduled',
          priority: intervention.priority || 'medium'
        });
      }
    });
  }
  
  // Ajouter les tâches
  if (tasks && Array.isArray(tasks)) {
    tasks.forEach(task => {
      if (task.dueDate instanceof Date || typeof task.dueDate === 'string') {
        events.push({
          id: task.id,
          title: task.title,
          date: task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate),
          type: 'task' as 'maintenance' | 'intervention' | 'task',
          equipment: task.equipment || '',
          status: task.status || 'scheduled',
          priority: task.priority || 'medium'
        });
      }
    });
  }
  
  // Trier les événements par date
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};
