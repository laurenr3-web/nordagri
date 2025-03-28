
import React from 'react';
import OrderDialog from '@/components/parts/dialogs/OrderDialog';
import { Part } from '@/types/Part';
import { LocalPart, convertToPart } from '@/utils/partTypeConverters';

interface OrderManagementDialogProps {
  selectedPart: LocalPart | null;
  isOrderDialogOpen: boolean;
  setIsOrderDialogOpen: (open: boolean) => void;
  orderQuantity?: string;
  setOrderQuantity?: (quantity: string) => void;
  orderNote?: string;
  setOrderNote?: (note: string) => void;
  isOrderSuccess?: boolean;
  handleOrderSubmit?: () => void;
}

const OrderManagementDialog: React.FC<OrderManagementDialogProps> = ({
  selectedPart,
  isOrderDialogOpen,
  setIsOrderDialogOpen,
  orderQuantity,
  setOrderQuantity,
  orderNote,
  setOrderNote,
  isOrderSuccess,
  handleOrderSubmit
}) => {
  // Convert selectedPart to the expected Part type
  const convertedSelectedPart: Part | null = selectedPart ? convertToPart(selectedPart) : null;

  return (
    <OrderDialog 
      isOpen={isOrderDialogOpen}
      onOpenChange={setIsOrderDialogOpen}
      selectedPart={convertedSelectedPart}
      orderQuantity={orderQuantity || ''}
      setOrderQuantity={setOrderQuantity || (() => {})}
      orderNote={orderNote || ''}
      setOrderNote={setOrderNote || (() => {})}
      isOrderSuccess={isOrderSuccess || false}
      handleOrderSubmit={handleOrderSubmit || (() => {})}
    />
  );
};

export default OrderManagementDialog;
