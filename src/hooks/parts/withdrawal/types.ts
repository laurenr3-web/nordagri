
/**
 * Interface pour les raisons de retrait de pièces
 */
export interface WithdrawalReason {
  id: string;
  label: string;
  requiresComment?: boolean;
}

/**
 * Interface pour les interventions associées aux retraits
 */
export interface Intervention {
  id: number;
  title: string;
  equipment_id?: number;
  date?: string;
  status?: string;
}

/**
 * Interface pour les données de retrait de pièces
 */
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

/**
 * Interface pour les enregistrements d'historique de retrait
 */
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
