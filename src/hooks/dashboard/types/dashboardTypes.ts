import React from 'react';

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
  km?: number | null; // Add the km property
  valeur_actuelle?: number | null; // Add the valeur_actuelle property
}

export interface MaintenanceEvent {
  id: string | number;
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

export interface DashboardData {
  loading: boolean;
  statsData: StatsCardData[];
  equipmentData: EquipmentItem[];
  maintenanceEvents: MaintenanceEvent[];
  alertItems: AlertItem[];
  upcomingTasks: UpcomingTask[];
  urgentInterventions: UrgentIntervention[];
  stockAlerts: StockAlert[];
  weeklyCalendarEvents: CalendarEvent[];
}
