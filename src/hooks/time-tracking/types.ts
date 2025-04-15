export type TimeEntryTaskType = 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';

export interface TaskType {
  id: string;
  name: TimeEntryTaskType;
  affecte_compteur: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  user_name?: string;
  equipment_id?: number;
  intervention_id?: number;
  task_type_id?: string;
  task_type: TimeEntryTaskType;
  custom_task_type?: string;
  notes?: string;
  start_time: string;
  end_time?: string | null;
  status: TimeEntryStatus;
  equipment_name?: string;
  intervention_title?: string;
  location?: string;
  location_id?: number;
  current_duration?: string;
  created_at: string;
  updated_at: string;
}

export type TimeEntryStatus = 'active' | 'paused' | 'completed' | 'disputed';

export interface ActiveTimeEntry extends TimeEntry {
  current_duration: string;
}

export interface TimeSpentByEquipment {
  equipment_id: number;
  equipment_name: string;
  total_minutes: number;
}

export interface TimeEntryFormData {
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  custom_task_type: string;
  location_id?: number;
  location?: string;
  notes: string;
}
