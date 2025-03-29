
import { useState } from 'react';
import { toast } from 'sonner';
import { Part } from '@/types/Part';
import { ensureNumber } from '@/utils/typeAdapters';

export const useOrderParts = () => {
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [orderQuantity, setOrderQuantity] = useState<string>('1');
  const [orderNote, setOrderNote] = useState<string>('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);

  const openOrderDialog = (part: Part) => {
    setSelectedPart(part);
    setOrderQuantity('1'); // Reset quantity on new order
    setOrderNote(''); // Reset note on new order
    setIsOrderSuccess(false);
    setIsOrderDialogOpen(true);
  };

  const handleOrderSubmit = () => {
    // Validate quantity
    const quantity = ensureNumber(orderQuantity, 0);
    
    if (quantity <= 0) {
      toast.error("Veuillez entrer une quantité valide");
      return;
    }
    
    if (!selectedPart) {
      toast.error("Aucune pièce sélectionnée");
      return;
    }
    
    // Simulating order submission
    console.log(`Commande de ${quantity} ${selectedPart.name} envoyée`);
    
    // In a real app, you would call an API to place the order
    // For now, we'll just simulate success
    setTimeout(() => {
      setIsOrderSuccess(true);
      toast.success(`Commande de ${quantity} ${selectedPart.name} placée avec succès`);
      
      // Close dialog after a short delay
      setTimeout(() => {
        setIsOrderDialogOpen(false);
      }, 2000);
    }, 1000);
  };

  return {
    selectedPart,
    setSelectedPart,
    orderQuantity,
    setOrderQuantity,
    orderNote,
    setOrderNote,
    isOrderSuccess,
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    openOrderDialog,
    handleOrderSubmit
  };
};
