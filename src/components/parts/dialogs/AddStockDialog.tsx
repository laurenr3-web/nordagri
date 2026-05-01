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
  const [sessionAdded, setSessionAdded] = useState<number>(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSessionAdded(0);
    }
  }, [isOpen, part?.id]);

  const mutation = useMutation({
    mutationFn: async (): Promise<{ newQty: number; added: number }> => {
      if (!part) throw new Error('Aucune pièce sélectionnée');
      if (quantity <= 0) throw new Error('La quantité doit être supérieure à 0');

      const partId = typeof part.id === 'string' ? parseInt(part.id) : part.id;
      // Read fresh quantity to avoid stale stock when chaining adds
      const { data: current, error: readError } = await supabase
        .from('parts_inventory')
        .select('quantity')
        .eq('id', partId)
        .single();
      if (readError) throw readError;

      const currentQty = (current?.quantity as number | null) ?? 0;
      const newQty = currentQty + quantity;

      const { error } = await supabase
        .from('parts_inventory')
        .update({ quantity: newQty })
        .eq('id', partId);

      if (error) throw error;
      return { newQty, added: quantity };
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Erreur lors de la mise à jour du stock');
    },
  });

  if (!part) return null;

  const baseStock = (part.stock ?? 0) + sessionAdded;
  const newStock = baseStock + (Number.isFinite(quantity) ? quantity : 0);

  const handleConfirm = (continueAdding: boolean) => {
    mutation.mutate(undefined, {
      onSuccess: ({ newQty, added }) => {
        queryClient.invalidateQueries({ queryKey: ['parts'] });
        toast.success(`+${added} ajouté(s) — stock : ${newQty}`);
        if (continueAdding) {
          setSessionAdded((prev) => prev + added);
          setQuantity(1);
        } else {
          onOpenChange(false);
        }
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="truncate">Ajouter au stock — {part.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between text-sm">
            <span>Stock actuel</span>
            <span className="font-medium tabular-nums">
              {baseStock} unité(s)
              {sessionAdded > 0 && (
                <span className="ml-2 text-xs text-green-600">
                  (+{sessionAdded} cette session)
                </span>
              )}
            </span>
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

        <DialogFooter className="gap-2 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            {sessionAdded > 0 ? 'Fermer' : 'Annuler'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={mutation.isPending || quantity <= 0}
            onClick={() => handleConfirm(true)}
            className="w-full sm:w-auto"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              'Ajouter et continuer'
            )}
          </Button>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            disabled={mutation.isPending || quantity <= 0}
            onClick={() => handleConfirm(false)}
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout...
              </>
            ) : (
              `Ajouter +${quantity > 0 ? quantity : 0}`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddStockDialog;