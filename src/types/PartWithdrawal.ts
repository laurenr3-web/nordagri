
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
  
  // Champs joints
  part_name?: string;
  equipment_name?: string;
  user_name?: string;
}
