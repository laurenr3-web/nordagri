
import { useState } from 'react';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';

export const useOrderSlice = () => {
  const { toast } = useToast();
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [orderNote, setOrderNote] = useState('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  const handleOrderSubmit = (
    selectedPart: Part | null, 
    parts: Part[], 
    setParts: (parts: Part[]) => void,
    setIsOrderDialogOpen: (isOpen: boolean) => void
  ) => {
    // Here you would normally submit the order to your backend
    // For now, we'll just show a success message
    setIsOrderSuccess(true);
    
    // Update the part stock in our local state
    if (selectedPart) {
      const quantity = parseInt(orderQuantity);
      setParts(parts.map(part => 
        part.id === selectedPart.id 
          ? { ...part, stock: part.stock + quantity } 
          : part
      ));
    }
    
    // Show a toast notification
    setTimeout(() => {
      setIsOrderDialogOpen(false);
      toast({
        title: "Order placed successfully",
        description: `Ordered ${orderQuantity} units of ${selectedPart?.name}`,
      });
    }, 1500);
  };

  return {
    orderQuantity,
    setOrderQuantity,
    orderNote,
    setOrderNote,
    isOrderSuccess,
    setIsOrderSuccess,
    handleOrderSubmit,
  };
};
