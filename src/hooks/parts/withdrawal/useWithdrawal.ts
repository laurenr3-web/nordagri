
import { useWithdrawalHistory } from './useWithdrawalHistory';
import { useWithdrawalDialog } from './useWithdrawalDialog';
import { WITHDRAWAL_REASONS } from './constants';

export const useWithdrawal = () => {
  // Import functionality from both hooks
  const { getWithdrawalHistory, formatWithdrawalReason } = useWithdrawalHistory();
  const { 
    isWithdrawalDialogOpen, 
    setIsWithdrawalDialogOpen, 
    selectedPart, 
    setSelectedPart, 
    openWithdrawalDialog,
    withdrawalMutation,
    interventions
  } = useWithdrawalDialog();

  return {
    // States
    isWithdrawalDialogOpen,
    setIsWithdrawalDialogOpen,
    selectedPart,
    setSelectedPart,
    
    // Actions
    openWithdrawalDialog,
    withdrawalMutation,
    interventions,
    
    // History functions
    getWithdrawalHistory,
    formatWithdrawalReason,
    
    // Constants
    WITHDRAWAL_REASONS
  };
};

// Re-export the constants and types
export { WITHDRAWAL_REASONS } from './constants';
export type { PartsWithdrawal, Intervention } from './useWithdrawalDialog';
export type { WithdrawalRecord, WithdrawalReason } from './types';
