
import { TimeEntry, TimeEntryTaskType, TimeEntryStatus, TimeSpentByEquipment } from '@/hooks/time-tracking/types';

// Request type definitions for timeTracking service functions
export interface StartTimeEntryData {
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  task_type_id?: string;
  custom_task_type?: string;
  poste_travail?: string;
  title?: string;
  description?: string;
  notes?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  journee_id?: string;
}

export interface TimeEntriesFilter {
  userId: string;
  startDate?: Date;
  endDate?: Date;
  equipmentId?: number;
  interventionId?: number;
  taskType?: TimeEntryTaskType;
  status?: TimeEntryStatus;
}
