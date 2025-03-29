
import { ReactNode } from 'react';

// Stat type definition
export interface Stat {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
  trend: {
    value: number;
    isPositive: boolean;
  };
}

// Equipment data type
export interface EquipmentItem {
  id: number;
  name: string;
  type: string;
  image: string;
  status: 'operational' | 'maintenance' | 'repair';
  usage: {
    hours: number;
    target: number;
  };
  nextService: {
    type: string;
    due: string;
  };
}

// Maintenance event type
export interface MaintenanceEvent {
  id: string;
  title: string;
  date: Date;
  duration: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  equipment: string;
}

// Alert item type
export interface AlertItem {
  id: string;
  severity: 'high' | 'medium' | 'low';
  message: string;
  time: string;
  equipment: string;
}

// Task item type
export interface TaskItem {
  id: number;
  title: string;
  equipment: string;
  due: string;
  priority: 'critical' | 'high' | 'medium' | 'low' | string;
  assignee: string;
}
