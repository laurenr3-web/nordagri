
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
  rawData: any[],
  maintenanceMap?: Map<string, { type: string; due: string }>,
  dueMap?: Map<string, string>
): EquipmentData[] {
  return rawData.map(item => {
    // Récupérer les infos de maintenance si disponibles
    const maintenanceInfo = maintenanceMap?.get(item.id.toString());
    const dueDate = dueMap?.get(item.id.toString());
    
    return {
      id: item.id,
      name: item.name || `Equipment #${item.id}`,
      type: item.type || 'Unknown',
      status: validateEquipmentStatus(item.status || 'unknown'),
      image: item.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
      // Ajouter les informations de maintenance si disponibles
      usage: {
        hours: item.usage_hours || 0,
        target: item.usage_target || 500
      },
      nextService: {
        type: maintenanceInfo?.type || 'Regular maintenance',
        due: maintenanceInfo?.due || dueDate || 'Non planifié'
      }
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
      minRequired: part.reorderPoint || 5,
      partNumber: part.partNumber || part.reference || '',
      severity: part.stock === 0 ? 'high' : part.stock <= 3 ? 'medium' : 'low'
    }))
    .sort((a, b) => {
      // Trier par sévérité puis par niveau de stock
      if (a.severity === 'high' && b.severity !== 'high') return -1;
      if (a.severity !== 'high' && b.severity === 'high') return 1;
      if (a.severity === 'medium' && b.severity === 'low') return -1;
      if (a.severity === 'low' && b.severity === 'medium') return 1;
      return a.currentStock - b.currentStock;
    });
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
      scheduledDate: new Date(item.date),
      priority: item.priority || 'medium',
      status: item.status || 'pending',
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
      events.push({
        id: `maintenance-${item.id}`,
        title: item.title || 'Maintenance',
        date: new Date(item.due_date),
        type: 'maintenance',
        priority: item.priority || 'medium',
        status: item.status || 'scheduled'
      });
    }
  });

  // Ajouter les interventions
  interventions.forEach(item => {
    if (item.date) {
      events.push({
        id: `intervention-${item.id}`,
        title: item.title || 'Intervention',
        date: new Date(item.date),
        type: 'intervention',
        priority: item.priority || 'medium',
        status: item.status || 'pending'
      });
    }
  });

  // Ajouter les tâches
  tasks.forEach(item => {
    if (item.due_date) {
      events.push({
        id: `task-${item.id}`,
        title: item.title || 'Task',
        date: new Date(item.due_date),
        type: 'task',
        priority: item.priority || 'medium',
        status: item.status || 'scheduled'
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
