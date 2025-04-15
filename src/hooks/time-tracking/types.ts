
export type TimeEntryTaskType = 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';
export type TimeEntryStatus = 'active' | 'completed' | 'paused' | 'disputed';

export interface TimeEntry {
  id: string;
  user_id: string;
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  custom_task_type?: string;
  start_time: string | Date;
  end_time?: string | Date | null;
  notes?: string;
  location?: string;
  location_id?: number;
  status: TimeEntryStatus;
  created_at: string | Date;
  updated_at: string | Date;
  
  // Propriétés jointes pour l'affichage
  equipment_name?: string;
  intervention_title?: string;
  user_name?: string;
  current_duration?: string;
}

export interface ActiveTimeEntry {
  id: string;
  user_id: string;
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  custom_task_type?: string;
  start_time: string | Date;
  location?: string;
  location_id?: number;
  status: TimeEntryStatus;
  equipment_name?: string;
  intervention_title?: string;
  current_duration?: string;
  created_at: string | Date; // Added to match TimeEntry
  updated_at: string | Date; // Added to match TimeEntry
}

export interface TimeSpentByEquipment {
  equipment_id: number;
  equipment_name: string;
  total_minutes: number;
}
