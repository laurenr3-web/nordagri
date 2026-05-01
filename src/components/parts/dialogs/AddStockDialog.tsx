import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Part } from '@/types/Part';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Minus, Plus } from 'lucide-react';

interface AddStockDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
}

const QUICK_AMOUNTS = [1, 5, 10, 25];

export const AddStockDialog: React.FC<AddStockDialogProps> = ({ isOpen, onOpenChange, part }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) setQuantity(1);
  }, [isOpen, part?.id]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!part) throw new Error('Aucune pièce sélectionnée');
      if (quantity <= 0) throw new Error('La quantité doit être supérieure à 0');

      const partId = typeof part.id === 'string' ? parseInt(part.id) : part.id;
      const newQty = (part.stock ?? 0) + quantity;

      const { error } = await supabase
        .from('parts_inventory')
        .update({ quantity: newQty })
        .eq('id', partId);

      if (error) throw error;
      return newQty;
    },
    onSuccess: (newQty) => {
      queryClient.invalidateQueries({ queryKey: ['parts'] });
      toast.success(`Stock mis à jour : ${newQty} unité(s)`);
      onOpenChange(false);
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du stock');
    },
  });

  if (!part) return null;

  const newStock = (part.stock ?? 0) + (Number.isFinite(quantity) ? quantity : 0);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="truncate">Ajouter au stock — {part.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between text-sm">
            <span>Stock actuel</span>
            <span className="font-medium">{part.stock} unité(s)</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-qty">Quantité à ajouter</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="add-qty"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_AMOUNTS.map((n) => (
                <Button
                  key={n}
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setQuantity(n)}
                >
                  +{n}
                </Button>
              ))}
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 text-green-700 p-2 rounded-md flex items-center justify-between text-sm">
            <span>Nouveau stock</span>
            <span className="font-semibold tabular-nums">{newStock} unité(s)</span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={mutation.isPending || quantity <= 0}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              `Ajouter ${quantity > 0 ? `+${quantity}` : ''}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockDialog;