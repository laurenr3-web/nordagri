
import { useWithdrawal } from './withdrawal/useWithdrawal';

// Re-export all the types and constants from useWithdrawal
export * from './withdrawal/useWithdrawal';

// Hook principal pour la gestion des retraits
export const usePartsWithdrawal = () => {
  // Use the consolidated withdrawal hook
  const withdrawal = useWithdrawal();
  
  return {
    // Pass along all properties from useWithdrawal
    ...withdrawal
  };
};

// For React imports that might be needed by other files
import React from 'react';
