
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Part } from '@/types/Part';
import { withdrawPart, PartWithdrawalRequest } from '@/services/supabase/parts/withdrawPart';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import { Loader2 } from 'lucide-react';

interface WithdrawPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPart?: Part | null;
  onSuccess?: () => void;
}

const WithdrawPartDialog: React.FC<WithdrawPartDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedPart,
  onSuccess
}) => {
  const [part, setPart] = useState<Part | null>(selectedPart || null);
  const [quantity, setQuantity] = useState<number>(1);
  const [equipmentId, setEquipmentId] = useState<number | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: equipments = [], isLoading: isLoadingEquipments } = useEquipmentOptions();
  
  // Equipment options for combobox
  const equipmentOptions = equipments.map(equipment => ({
    value: equipment.id.toString(),
    label: equipment.name
  }));
  
  useEffect(() => {
    if (selectedPart) {
      setPart(selectedPart);
    }
  }, [selectedPart]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!part) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une pièce",
        variant: "destructive"
      });
      return;
    }
    
    if (!quantity || quantity <= 0) {
      toast({
        title: "Erreur",
        description: "La quantité doit être supérieure à 0",
        variant: "destructive"
      });
      return;
    }
    
    if (quantity > part.stock) {
      toast({
        title: "Stock insuffisant",
        description: `Il n'y a que ${part.stock} unités disponibles`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const withdrawalData: PartWithdrawalRequest = {
        part_id: part.id as number,
        quantity,
        equipment_id: equipmentId,
        notes
      };
      
      const result = await withdrawPart(withdrawalData);
      
      if (result.success) {
        toast({
          title: "Succès",
          description: result.message
        });
        
        // Reset form and close dialog
        setQuantity(1);
        setEquipmentId(null);
        setNotes('');
        
        if (onSuccess) {
          onSuccess();
        }
        
        onOpenChange(false);
      } else {
        toast({
          title: "Erreur",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Retirer une pièce</SheetTitle>
          <SheetDescription>
            Enregistrer un retrait de pièce de l'inventaire
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* Part info display */}
          {part && (
            <div className="rounded-md border p-4 bg-muted/50">
              <div className="flex gap-4">
                {part.image && (
                  <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                    <img 
                      src={part.image} 
                      alt={part.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium">{part.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Référence: {part.partNumber}</p>
                    <p>Stock disponible: {part.stock} unités</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantité à retirer*</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max={part?.stock || 999}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Maximum disponible: {part?.stock || 0} unités
            </p>
          </div>
          
          {/* Equipment selection */}
          <div className="space-y-2">
            <Label htmlFor="equipment">Équipement (optionnel)</Label>
            {isLoadingEquipments ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Chargement des équipements...</span>
              </div>
            ) : (
              <Combobox
                options={equipmentOptions}
                placeholder="Sélectionner un équipement"
                onSelect={(value) => setEquipmentId(Number(value))}
                emptyMessage="Aucun équipement trouvé"
              />
            )}
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optionnel)</Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires sur ce retrait"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          {/* Submit buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !part}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Retirer la pièce'
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default WithdrawPartDialog;
