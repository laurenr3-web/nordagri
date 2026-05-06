export type PlannedShiftStatus = 'scheduled' | 'confirmed' | 'absent' | 'completed';

export interface PlannedShift {
  id: string;
  farm_id: string;
  farm_member_id: string;
  shift_date: string; // YYYY-MM-DD
  start_time: string | null; // HH:mm[:ss]
  end_time: string | null;
  role: string | null;
  notes: string | null;
  status: PlannedShiftStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamTodayCardVM {
  shiftId: string | null;
  farmMemberId: string;
  userId: string | null;
  displayName: string;
  startTime: string | null;
  endTime: string | null;
  roleLabel: string | null;
  shiftStatus: PlannedShiftStatus | null;
  assignedCount: number;
  urgentCount: number;
}

export interface UpsertPlannedShiftInput {
  id?: string;
  farm_id: string;
  farm_member_id: string;
  shift_date: string;
  start_time?: string | null;
  end_time?: string | null;
  role?: string | null;
  notes?: string | null;
  status: PlannedShiftStatus;
}