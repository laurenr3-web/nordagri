
export interface PartWithdrawal {
  id: string;
  part_id: number;
  quantity: number;
  withdrawn_by: string;
  withdrawn_at: string;
  equipment_id?: number;
  task_id?: number;
  notes?: string;
  farm_id?: string;
  created_at: string;
  part_name?: string;
  equipment_name?: string;
  user_name?: string;
}

export interface WithdrawPartData {
  part_id: number;
  quantity: number;
  equipment_id?: number | null;
  task_id?: number | null;
  notes?: string;
  withdrawn_by?: string;
  farm_id?: string;
}
