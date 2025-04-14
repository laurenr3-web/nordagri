
import { 
  StatsData, 
  EquipmentData, 
  MaintenanceEvent, 
  AlertItem, 
  Task, 
  StockAlert,
  CalendarEvent,
  UrgentIntervention
} from '@/hooks/dashboard/types/dashboardTypes';
import { Part } from '@/types/Part';

/**
 * Transforme les données d'équipement brutes en format exploitable par l'UI
 */
export function transformEquipmentData(
  rawData: any[]
): EquipmentData[] {
  return rawData.map(item => {
    return {
      id: item.id,
      name: item.name || `Equipment #${item.id}`,
      type: item.type || 'Unknown',
      status: validateEquipmentStatus(item.status || 'unknown'),
      image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
      usage_hours: item.usage_hours || 0,
      usage_target: item.usage_target || 500,
      model: item.model || ''
    };
  });
}

/**
 * Valide et normalise le statut d'équipement
 */
function validateEquipmentStatus(status: string): string {
  const validStatuses = ['operational', 'maintenance', 'broken', 'inactive', 'unknown'];
  return validStatuses.includes(status.toLowerCase()) ? status.toLowerCase() : 'unknown';
}

/**
 * Dérive les alertes de stock à partir des données de pièces
 */
export function deriveStockAlerts(parts: Part[]): StockAlert[] {
  return parts
    .filter(part => {
      const stock = part.stock || part.quantity || 0;
      const threshold = part.reorderPoint || 5;
      return stock <= threshold;
    })
    .map(part => ({
      id: part.id,
      name: part.name,
      currentStock: part.stock || part.quantity || 0,
      reorderPoint: part.reorderPoint || 5,
      percentRemaining: calculatePercentRemaining(part.stock || part.quantity || 0, part.reorderPoint || 5),
      category: part.category || 'Parts'
    }))
    .sort((a, b) => {
      // Trier par pourcentage restant (croissant)
      return a.percentRemaining - b.percentRemaining;
    });
}

/**
 * Calcule le pourcentage restant par rapport au seuil de réapprovisionnement
 */
function calculatePercentRemaining(current: number, threshold: number): number {
  if (threshold <= 0) return 0;
  return Math.min(100, Math.max(0, (current / threshold) * 100));
}

/**
 * Dérive les interventions urgentes depuis les données d'interventions
 */
export function deriveUrgentInterventions(interventions: any[]): UrgentIntervention[] {
  return interventions
    .filter(item => item.priority === 'high' || item.status === 'pending')
    .slice(0, 5)
    .map(item => ({
      id: item.id,
      title: item.title,
      equipment: item.equipment || 'Unknown',
      date: item.date ? new Date(item.date) : new Date(),
      priority: item.priority || 'medium',
      status: item.status || 'pending',
      technician: item.technician || 'Non assigné',
      location: item.location || ''
    }));
}

/**
 * Crée des événements de calendrier à partir des différentes sources de données
 */
export function createCalendarEvents(
  maintenanceEvents: any[],
  interventions: any[],
  tasks: any[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Ajouter les événements de maintenance
  maintenanceEvents.forEach(item => {
    if (item.due_date) {
      const eventDate = new Date(item.due_date);
      events.push({
        id: `maintenance-${item.id}`,
        title: item.title || 'Maintenance',
        date: eventDate,
        start: eventDate, // Set start equal to date for compatibility
        type: 'maintenance',
        equipment: item.equipment || 'Non spécifié',
        status: item.status || 'scheduled',
        priority: item.priority || 'medium'
      });
    }
  });

  // Ajouter les interventions
  interventions.forEach(item => {
    if (item.date) {
      const eventDate = new Date(item.date);
      events.push({
        id: `intervention-${item.id}`,
        title: item.title || 'Intervention',
        date: eventDate,
        start: eventDate, // Set start equal to date for compatibility
        type: 'intervention',
        equipment: item.equipment || 'Non spécifié',
        status: item.status || 'pending',
        priority: item.priority || 'medium'
      });
    }
  });

  // Ajouter les tâches
  tasks.forEach(item => {
    if (item.due_date) {
      const eventDate = new Date(item.due_date);
      events.push({
        id: `task-${item.id}`,
        title: item.title || 'Task',
        date: eventDate,
        start: eventDate, // Set start equal to date for compatibility
        type: 'task',
        equipment: item.equipment || 'N/A',
        status: item.status || 'scheduled',
        priority: item.priority || 'medium'
      });
    }
  });

  // Trier par date
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Filtre les événements de calendrier pour ne montrer que ceux de la semaine en cours
 */
export function filterWeeklyCalendarEvents(events: CalendarEvent[]): CalendarEvent[] {
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Dimanche comme premier jour
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Samedi comme dernier jour
  endOfWeek.setHours(23, 59, 59, 999);

  return events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate >= startOfWeek && eventDate <= endOfWeek;
  });
}
