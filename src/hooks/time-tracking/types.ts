// Task type enum
export type TimeEntryTaskType = 'maintenance' | 'repair' | 'inspection' | 'installation' | 'other';

// Status enum
export type TimeEntryStatus = 'active' | 'paused' | 'completed' | 'disputed';

// Time entry shape
export interface TimeEntry {
  id: string;
  user_id: string;
  owner_name?: string;
  user_name?: string;
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  task_type_id?: string;
  custom_task_type?: string;
  start_time: string;
  end_time?: string;
  status: TimeEntryStatus;
  equipment_name?: string;
  intervention_title?: string;
  notes?: string;
  description?: string;
  location?: string;
  poste_travail?: string;
  current_duration?: string;
  created_at?: string;
  updated_at?: string;
  journee_id?: string;
}

export interface TaskType {
  id: string;
  name: TimeEntryTaskType;
  affecte_compteur: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TimeSpentByEquipment {
  equipment_id: number;
  equipment_name: string;
  total_minutes: number;
}
