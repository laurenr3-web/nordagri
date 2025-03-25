
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { partsService } from '@/services/supabase/partsService';

export const useOrderParts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [orderQuantity, setOrderQuantity] = useState('1');
  const [orderNote, setOrderNote] = useState('');
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);

  // Order parts mutation
  const orderPartMutation = useMutation({
    mutationFn: (part: Part) => {
      console.log('Ordering more of part in Supabase:', part);
      const updatedPart = {
        ...part,
        stock: part.stock + parseInt(orderQuantity),  // Order more based on quantity
      };
      return partsService.updatePart(updatedPart);
    },
    onSuccess: (updatedPart) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      
      toast({
        title: "Commande passée",
        description: `La commande pour ${updatedPart.name} a été passée`,
      });
      
      setIsOrderSuccess(true);
    },
    onError: (error) => {
      console.error('Error ordering part:', error);
      toast({
        title: "Erreur",
        description: "Impossible de passer la commande",
        variant: "destructive",
      });
    }
  });

  // Function to order a part
  const handleOrderPart = (part: Part) => {
    console.log('Ordering part:', part);
    orderPartMutation.mutate(part);
  };

  const handleOrderSubmit = (selectedPart: Part | null) => {
    if (selectedPart) {
      handleOrderPart(selectedPart);
    }
  };

  const resetOrderForm = () => {
    setOrderQuantity('1');
    setOrderNote('');
    setIsOrderSuccess(false);
  };

  return {
    orderQuantity,
    setOrderQuantity,
    orderNote,
    setOrderNote,
    isOrderSuccess,
    setIsOrderSuccess,
    handleOrderSubmit,
    resetOrderForm
  };
};
