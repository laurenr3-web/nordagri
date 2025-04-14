
// Basic types for dashboard data
export interface StatsData {
  id: number;
  title: string;
  value: string;
  change: string;
  type: 'positive' | 'negative' | 'neutral';
  icon?: any;
}

export interface EquipmentData {
  id: number;
  name: string;
  type: string;
  status: string;
  image?: string;
  usage_hours?: number;
  usage_target?: number;
  model?: string;
}

export interface MaintenanceEvent {
  id: number | string;
  title: string;
  description?: string;
  due_date?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  equipment?: string;
  equipment_id?: number;
  notes?: string;
  date?: string | Date; // Add date field
}

export interface AlertItem {
  id: number; 
  title: string;
  message?: string;
  description?: string;
  type: string;
  date?: Date;
  time?: string;
  equipment?: string;
  equipmentId?: number;
  equipmentName?: string;
  status?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low'; // Add severity field
  timestamp?: Date; // Add timestamp field
}

export interface Task {
  id: number | string;
  title: string;
  description?: string;
  notes?: string;
  due_date?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  equipment?: string;
  equipment_id?: number;
}

// Derived types used by components
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

export interface CalendarEvent {
  id: number | string;
  title: string;
  date: Date;
  start: Date;
  type: 'maintenance' | 'intervention' | 'task';
  equipment: string;
  status: string;
  priority: string;
}

export interface StockAlert {
  id: number | string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  percentRemaining: number;
  category: string;
}

export interface UrgentIntervention {
  id: number | string;
  title: string;
  equipment: string;
  priority: 'high' | 'medium' | 'low';
  date?: Date;
  status: string;
  technician: string;
  location: string;
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
