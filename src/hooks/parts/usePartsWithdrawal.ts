
import { useWithdrawalHistory } from './withdrawal/useWithdrawalHistory';

// Re-exporter les types depuis useWithdrawalHistory
export type { WithdrawalRecord } from './withdrawal/types';

// Hook principal pour la gestion des retraits
export const usePartsWithdrawal = () => {
  // États locaux pour le dialogue de retrait
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = React.useState(false);
  const [selectedPart, setSelectedPart] = React.useState<any>(null);

  // Importer les fonctionnalités de l'historique des retraits
  const { getWithdrawalHistory, formatWithdrawalReason, WITHDRAWAL_REASONS } = useWithdrawalHistory();

  // Ouvrir le dialogue avec une pièce sélectionnée
  const openWithdrawalDialog = (part: any) => {
    setSelectedPart(part);
    setIsWithdrawalDialogOpen(true);
  };

  return {
    // États
    isWithdrawalDialogOpen,
    setIsWithdrawalDialogOpen,
    selectedPart,
    setSelectedPart,
    
    // Actions
    openWithdrawalDialog,
    
    // Fonctions de l'historique
    getWithdrawalHistory,
    formatWithdrawalReason,
    WITHDRAWAL_REASONS
  };
};

// Nécessaire pour l'importation React
import React from 'react';
