
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Part } from '@/types/Part';

interface OrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPart: Part | null;
  orderQuantity: string;
  setOrderQuantity: (quantity: string) => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  isOrderSuccess: boolean;
  handleOrderSubmit: () => void;
}

const OrderDialog: React.FC<OrderDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedPart,
  orderQuantity,
  setOrderQuantity,
  orderNote,
  setOrderNote,
  isOrderSuccess,
  handleOrderSubmit
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Order Parts</DialogTitle>
          <DialogDescription>
            {isOrderSuccess ? 'Order completed successfully!' : 'Specify the quantity and details for your order'}
          </DialogDescription>
        </DialogHeader>
        
        {isOrderSuccess ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium">Order Successful</h3>
            <p className="text-muted-foreground">
              Your order for {orderQuantity} units of {selectedPart?.name} has been placed.
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 py-4">
              {selectedPart && (
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={selectedPart.image || selectedPart.imageUrl || ''} 
                      alt={selectedPart.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedPart.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPart.partNumber || selectedPart.reference}</p>
                    <p className="text-sm">${selectedPart.price.toFixed(2)} per unit</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input 
                  id="quantity" 
                  type="number" 
                  min="1" 
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Input 
                  id="notes" 
                  placeholder="Any special instructions" 
                  value={orderNote} 
                  onChange={(e) => setOrderNote(e.target.value)}
                />
              </div>
              
              {selectedPart && (
                <div className="rounded-md bg-muted p-3 text-sm">
                  <p className="font-medium">Order Summary:</p>
                  <p>{selectedPart.name} x {orderQuantity}</p>
                  <p className="font-medium mt-2">
                    Total: ${(selectedPart.price * parseInt(orderQuantity || '0')).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button onClick={handleOrderSubmit}>Place Order</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrderDialog;
