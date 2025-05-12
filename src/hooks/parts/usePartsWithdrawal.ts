
import { useWithdrawalDialog } from './withdrawal/useWithdrawalDialog';
import { useWithdrawalHistory } from './withdrawal/useWithdrawalHistory';
import { WITHDRAWAL_REASONS } from './withdrawal/constants';
import { WithdrawalReason, Intervention, PartsWithdrawal, WithdrawalRecord } from './withdrawal/types';

// Re-export types for backwards compatibility
export { WithdrawalReason, Intervention, PartsWithdrawal, WithdrawalRecord };

// Re-export constants for backwards compatibility
export { WITHDRAWAL_REASONS };

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
