export type TimeEntryTaskType = 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';

export interface TaskType {
  id: string;
  name: TimeEntryTaskType;
  affecte_compteur: boolean;
  created_at: string;
  updated_at: string;
}

export type TimeEntryFormData = {
  task_type: TimeEntryTaskType;
  task_type_id?: string;
  custom_task_type?: string;
  equipment_id?: number;
  intervention_id?: number;
  title: string;
  description?: string;
  notes?: string;
  location_id?: number;
  location?: string;
  priority?: 'low' | 'medium' | 'high';
};

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
