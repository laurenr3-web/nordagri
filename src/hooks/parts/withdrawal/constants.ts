
import { WithdrawalReason } from './types';

// Constants used in withdrawal components
export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'repair', label: 'Réparation' },
  { id: 'replace', label: 'Remplacement' },
  { id: 'used_up', label: 'Utilisation normale' },
  { id: 'defective', label: 'Pièce défectueuse' },
  { id: 'expired', label: 'Expirée' },
  { id: 'lost', label: 'Perdue/Égarée' },
  { id: 'other', label: 'Autre (préciser)' }
];
