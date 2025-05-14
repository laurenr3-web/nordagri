
import { WithdrawalReason } from './types';

// Raisons de retrait de pièces prédéfinies
export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  {
    id: 'intervention',
    label: 'Intervention de maintenance',
    description: 'Pièce utilisée dans le cadre d\'une intervention de maintenance'
  },
  {
    id: 'defective',
    label: 'Pièce défectueuse',
    description: 'Pièce retirée car défectueuse ou endommagée'
  },
  {
    id: 'expired',
    label: 'Pièce périmée',
    description: 'Pièce retirée car dépassant sa date de péremption'
  },
  {
    id: 'inventory_adjustment',
    label: 'Ajustement d\'inventaire',
    description: 'Correction suite à inventaire physique'
  },
  {
    id: 'other',
    label: 'Autre raison',
    description: 'Autre raison de retrait (à préciser)'
  }
];
