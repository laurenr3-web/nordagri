import { useState } from 'react';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
// Update import to use the new path
import { addPart } from '@/services/supabase/parts';

export function useOrderParts() {
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [selectedPartForOrder, setSelectedPartForOrder] = useState<Part | null>(null);
  const { toast } = useToast();

  const openOrderDialog = (part: Part) => {
    setSelectedPartForOrder(part);
    setIsOrderDialogOpen(true);
    setOrderQuantity(1); // Reset quantity when opening the dialog
  };

  const closeOrderDialog = () => {
    setIsOrderDialogOpen(false);
    setSelectedPartForOrder(null);
    setOrderQuantity(1); // Reset quantity when closing the dialog
  };

  const handleOrderSubmit = async () => {
    if (!selectedPartForOrder) {
      toast({
        title: "Erreur",
        description: "Aucune pièce sélectionnée pour la commande.",
        variant: "destructive",
      });
      return;
    }

    // Simulate ordering process
    console.log(`Ordering ${orderQuantity} of ${selectedPartForOrder.name}`);

    // Optimistically update the stock (you might want to revert this on error)
    const newStock = selectedPartForOrder.stock + orderQuantity;

    // Show success message
    toast({
      title: "Commande soumise",
      description: `Vous avez commandé ${orderQuantity} de ${selectedPartForOrder.name}. Nouveau stock: ${newStock}`,
    });

    closeOrderDialog();
  };

  return {
    isOrderDialogOpen,
    setIsOrderDialogOpen,
    orderQuantity,
    setOrderQuantity,
    selectedPartForOrder,
    setSelectedPartForOrder,
    openOrderDialog,
    closeOrderDialog,
    handleOrderSubmit
  };
}
