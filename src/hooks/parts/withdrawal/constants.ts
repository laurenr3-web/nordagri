
import { WithdrawalReason } from './types';

export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  { id: 'intervention', label: 'Utilisée dans une intervention' },
  { id: 'defective', label: 'Pièce défectueuse' },
  { id: 'lost', label: 'Perte ou vol' },
  { id: 'return', label: 'Retour fournisseur' },
  { id: 'other', label: 'Autre', requiresComment: true }
];
