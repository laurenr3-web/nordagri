
import { useWithdrawalDialog } from './withdrawal/useWithdrawalDialog';
import { useWithdrawalHistory } from './withdrawal/useWithdrawalHistory';
import { WITHDRAWAL_REASONS } from './withdrawal/constants';
import { WithdrawalReason, Intervention, PartsWithdrawal, WithdrawalRecord } from './withdrawal/types';

// Re-export types for backwards compatibility
export type { WithdrawalReason, Intervention, PartsWithdrawal, WithdrawalRecord };

// Re-export constants for backwards compatibility
export { WITHDRAWAL_REASONS };

/**
 * Hook pour gérer les retraits de pièces du stock
 * 
 * Combine les fonctionnalités de dialogue de retrait et d'historique des retraits
 * dans une interface unique pour la gestion complète des retraits de pièces.
 * 
 * @returns {Object} Méthodes et données pour gérer les retraits de pièces
 */
export const usePartsWithdrawal = () => {
  const withdrawalDialog = useWithdrawalDialog();
  const withdrawalHistory = useWithdrawalHistory();

  return {
    // From withdrawal dialog hook
    ...withdrawalDialog,
    
    // From withdrawal history hook
    getWithdrawalHistory: withdrawalHistory.getWithdrawalHistory,
    formatWithdrawalReason: withdrawalHistory.formatWithdrawalReason,
    
    // Constants
    WITHDRAWAL_REASONS
  };
};
