
export interface StatsCardData {
  title: string;
  value: number | string;
  icon: any;
  change: number;
  description?: string;
}

export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  status: string;
  image?: string;
  usageHours?: number;
  usageTarget?: number;
  nextMaintenance?: string;
  maintenanceType?: string;
}

export interface MaintenanceEvent {
  id: number | string;
  title: string;
  date: Date;
  equipment: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo: string;
  duration: number;
}

export interface AlertItem {
  id: number | string;
  title: string;
  description: string;
  type: 'equipment' | 'maintenance' | 'inventory' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  // Additional fields needed by some components
  message?: string;
  time?: string;
  equipment?: string;
  date?: Date;
  equipmentId?: number;
  equipmentName?: string;
  status?: string;
}

export interface UpcomingTask {
  id: number | string;
  title: string;
  description: string;
  equipment: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo: string;
  status: string;
}

export interface UrgentIntervention {
  id: number | string;
  title: string;
  equipment: string;
  status: string;
  priority: string;
  date: Date;
  location: string;
  assignedTo: string;
}

export interface StockAlert {
  id: number | string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  percentRemaining: number;
  category: string;
}

export interface CalendarEvent {
  id: number | string;
  title: string;
  date: Date;
  start: Date; // Ajout de cette propriété manquante
  type: 'maintenance' | 'intervention' | 'task';
  equipment: string;
  status: string;
  priority: string;
}
