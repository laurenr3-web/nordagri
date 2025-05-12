
import { Part } from '@/types/Part';

export interface WithdrawalReason {
  id: string;
  label: string;
  requiresComment?: boolean;
}

export interface Intervention {
  id: number;
  title: string;
  equipment_id?: number;
  date?: string;
  status?: string;
}

export interface PartsWithdrawal {
  id?: number;
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason?: string;
  intervention_id?: number | null;
  comment?: string;
  user_id?: string;
  created_at?: string;
}

export interface WithdrawalRecord {
  id: number;
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason?: string | null;
  intervention_id?: number | null;
  comment?: string | null;
  user_id?: string | null;
  created_at: string;
  interventions?: {
    id: number;
    title: string;
  } | null;
}
