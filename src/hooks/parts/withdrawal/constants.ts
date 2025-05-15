
import { WithdrawalReason } from './types';

export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  { id: 'maintenance', label: 'Maintenance préventive' },
  { id: 'repair', label: 'Réparation' },
  { id: 'replacement', label: 'Remplacement' },
  { id: 'defective', label: 'Pièce défectueuse' },
  { id: 'inventory', label: 'Ajustement d\'inventaire' },
  { id: 'other', label: 'Autre raison' }
];
