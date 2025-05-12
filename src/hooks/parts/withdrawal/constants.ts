
import { WithdrawalReason } from './types';

/**
 * Liste des raisons prédéfinies pour le retrait de pièces
 * Ces raisons sont utilisées dans les formulaires de retrait pour
 * catégoriser la cause du retrait d'une pièce du stock.
 */
export const WITHDRAWAL_REASONS: WithdrawalReason[] = [
  { id: 'intervention', label: 'Utilisée dans une intervention' },
  { id: 'defective', label: 'Pièce défectueuse' },
  { id: 'lost', label: 'Perte ou vol' },
  { id: 'return', label: 'Retour fournisseur' },
  { id: 'other', label: 'Autre', requiresComment: true }
];
