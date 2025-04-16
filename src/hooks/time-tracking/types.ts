export interface TimeEntry {
  id: string;
  user_id: string;
  owner_name?: string;
  technician?: string;
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  task_type_id?: string;
  custom_task_type?: string;
  start_time: string;
  end_time?: string | null;
  notes?: string;
  status: TimeEntryStatus;
  equipment_name?: string;
  intervention_title?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface ActiveTimeEntry extends TimeEntry {
  current_duration?: string;
}

export type TimeEntryTaskType = 'maintenance' | 'repair' | 'inspection' | 'operation' | 'other';
export type TimeEntryStatus = 'active' | 'paused' | 'completed';

export interface TimeSpentByEquipment {
  equipment_id: number;
  equipment_name: string;
  total_minutes: number;
}

export interface TaskType {
  id: string;
  name: TimeEntryTaskType;
  affecte_compteur: boolean;
  created_at: string;
  updated_at: string;
}
