export type WorkShiftStatus = 'active' | 'completed';

export interface WorkShift {
  id: string;
  user_id: string;
  farm_id: string;
  punch_in_at: string;
  punch_out_at: string | null;
  status: WorkShiftStatus;
  notes: string | null;
  created_at: string;
}

export interface EnsureShiftResult {
  shift: WorkShift;
  autoCreated: boolean;
}

export interface ShiftTaskBreakdown {
  task_id: string | null;
  title: string;
  seconds: number;
}

export interface ShiftReport {
  shift: WorkShift;
  punchedSeconds: number;
  taskSeconds: number;
  offTaskSeconds: number;
  tasks: ShiftTaskBreakdown[];
}

export interface ShiftListItem {
  shift: WorkShift;
  punchedSeconds: number;
  taskSeconds: number;
  offTaskSeconds: number;
}

interface PgErrorShape {
  code?: string;
  message?: string;
}

export function isUniqueViolation(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false;
  return (err as PgErrorShape).code === '23505';
}
