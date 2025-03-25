
import { Part } from '@/types/Part';

export const usePartsActions = (
  partsDialogs: {
    selectedPart: Part | null;
    setSelectedPart: (part: Part | null) => void;
    setIsPartDetailsDialogOpen: (isOpen: boolean) => void;
    setIsOrderDialogOpen: (isOpen: boolean) => void;
  },
  orderParts: {
    handleOrderSubmit: (selectedPart: Part | null) => void;
  }
) => {
  // Function to handle submitting an order
  const handleOrderSubmit = () => {
    if (partsDialogs.selectedPart) {
      orderParts.handleOrderSubmit(partsDialogs.selectedPart);
    }
  };

  // Function to open part details
  const openPartDetails = (part: Part) => {
    partsDialogs.setSelectedPart(part);
    partsDialogs.setIsPartDetailsDialogOpen(true);
  };

  // Function to open order dialog
  const openOrderDialog = (part: Part) => {
    partsDialogs.setSelectedPart(part);
    partsDialogs.setIsOrderDialogOpen(true);
  };

  return {
    handleOrderSubmit,
    openPartDetails,
    openOrderDialog
  };
};
