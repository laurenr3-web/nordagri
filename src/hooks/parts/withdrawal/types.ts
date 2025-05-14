
// Types pour l'historique des retraits de pièces

// Enregistrement d'un retrait de pièce
export interface WithdrawalRecord {
  id: number;
  part_id: number;
  part_name: string;
  quantity: number;
  reason: string;
  custom_reason: string | null;
  intervention_id: number | null;
  comment: string | null;
  user_id: string;
  created_at: string;
  interventions: {
    id: number;
    title: string;
  } | null;
}

// Raison de retrait
export interface WithdrawalReason {
  id: string;
  label: string;
  description?: string;
}
