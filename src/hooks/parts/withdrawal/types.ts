
// Define the types shared across withdrawal components

export interface WithdrawalRecord {
  id: number;
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason?: string | null;
  created_at: string; // Added created_at for consistency with usage
  date: string;
  user_name: string;
  intervention_id?: number;
  interventions?: { // Added interventions object to match component usage
    id?: number;
    title?: string;
  };
  intervention_title?: string;
  comment?: string;
}

export interface WithdrawalReason {
  id: string;
  label: string;
}

export interface PartsWithdrawal {
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason?: string;
  intervention_id: number | null;
  comment?: string;
}

export interface Intervention {
  id: number;
  title: string;
  equipment_id: number;
  date: string;
  status: string;
}
