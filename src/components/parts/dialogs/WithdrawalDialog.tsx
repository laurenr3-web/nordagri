
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  usePartsWithdrawal, 
  WITHDRAWAL_REASONS, 
  PartsWithdrawal 
} from '@/hooks/parts/usePartsWithdrawal';
import { Part } from '@/types/Part';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WithdrawalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  isOpen,
  onOpenChange,
  part
}) => {
  const { withdrawalMutation, interventions } = usePartsWithdrawal();
  
  // État du formulaire
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState<string>('');
  const [customReason, setCustomReason] = useState('');
  const [interventionId, setInterventionId] = useState<string>('none');
  const [comment, setComment] = useState('');

  // Gestion des erreurs et validation
  const [errors, setErrors] = useState<{
    quantity?: string;
    reason?: string;
    customReason?: string;
  }>({});

  // Réinitialiser le formulaire quand la pièce change ou que le dialogue s'ouvre
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setReason('');
      setCustomReason('');
      setInterventionId('none');
      setComment('');
      setErrors({});
    }
  }, [isOpen, part]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: { quantity?: string; reason?: string; customReason?: string } = {};
    
    if (quantity <= 0) {
      newErrors.quantity = 'La quantité doit être supérieure à 0';
    }
    
    if (part && quantity > part.stock) {
      newErrors.quantity = 'La quantité ne peut pas dépasser le stock disponible';
    }
    
    if (!reason) {
      newErrors.reason = 'Veuillez sélectionner une raison';
    }
    
    if (reason === 'other' && !customReason.trim()) {
      newErrors.customReason = 'Veuillez préciser la raison';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !part) {
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }
    
    const withdrawalData: PartsWithdrawal = {
      part_id: typeof part.id === 'string' ? parseInt(part.id) : part.id,
      part_name: part.name,
      quantity,
      reason,
      custom_reason: reason === 'other' ? customReason : undefined,
      intervention_id: interventionId !== 'none' ? parseInt(interventionId) : null,
      comment
    };
    
    withdrawalMutation.mutate(withdrawalData);
  };

  // Si le formulaire est ouvert sans pièce sélectionnée (à partir du bouton global)
  const renderEmptyState = () => (
    <div className="py-4 text-center">
      <p className="text-muted-foreground">
        Veuillez sélectionner une pièce avant de pouvoir effectuer un retrait.
      </p>
      <Button 
        className="mt-4" 
        variant="outline" 
        onClick={() => onOpenChange(false)}
      >
        Fermer
      </Button>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Retirer une pièce</DialogTitle>
        </DialogHeader>
        
        {!part ? renderEmptyState() : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Pièce concernée (lecture seule) */}
            <div className="space-y-2">
              <Label htmlFor="part">Pièce concernée</Label>
              <Input 
                id="part" 
                value={part.name} 
                disabled 
                className="bg-muted"
              />
            </div>
            
            {/* Stock disponible - Indicateur visuel */}
            <div className="bg-muted/50 p-2 rounded-md flex items-center justify-between text-sm">
              <span>Stock disponible:</span>
              <span className="font-medium">{part.stock} unité(s)</span>
            </div>
            
            {/* Quantité à retirer */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité à retirer *</Label>
              <Input 
                id="quantity" 
                type="number"
                min={1}
                max={part.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className={errors.quantity ? "border-destructive" : ""}
              />
              {errors.quantity && (
                <p className="text-destructive text-sm">{errors.quantity}</p>
              )}
            </div>
            
            {/* Raison du retrait */}
            <div className="space-y-2">
              <Label htmlFor="reason">Raison du retrait *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger id="reason" className={errors.reason ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionner une raison" />
                </SelectTrigger>
                <SelectContent>
                  {WITHDRAWAL_REASONS.map((reasonOption) => (
                    <SelectItem key={reasonOption.id} value={reasonOption.id}>
                      {reasonOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.reason && (
                <p className="text-destructive text-sm">{errors.reason}</p>
              )}
            </div>
            
            {/* Champ pour "Autre" raison */}
            {reason === 'other' && (
              <div className="space-y-2">
                <Label htmlFor="customReason">Précisez la raison *</Label>
                <Input 
                  id="customReason" 
                  value={customReason} 
                  onChange={(e) => setCustomReason(e.target.value)}
                  className={errors.customReason ? "border-destructive" : ""}
                />
                {errors.customReason && (
                  <p className="text-destructive text-sm">{errors.customReason}</p>
                )}
              </div>
            )}
            
            {/* Association à une intervention existante */}
            <div className="space-y-2">
              <Label htmlFor="intervention">Associer à une intervention (optionnel)</Label>
              <Select value={interventionId} onValueChange={setInterventionId}>
                <SelectTrigger id="intervention">
                  <SelectValue placeholder="Sélectionner une intervention" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucune intervention</SelectItem>
                  {interventions.map((intervention) => (
                    <SelectItem key={intervention.id} value={intervention.id.toString()}>
                      {intervention.title || `Intervention #${intervention.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Commentaire */}
            <div className="space-y-2">
              <Label htmlFor="comment">Commentaire (optionnel)</Label>
              <Textarea 
                id="comment" 
                value={comment} 
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ajoutez des détails supplémentaires"
                className="resize-none"
              />
            </div>
            
            {/* Alerte si le stock est bas */}
            {part.stock <= part.reorderPoint && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-md flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Attention : stock bas</p>
                  <p>Le retrait de cette pièce fera passer le stock sous le seuil minimal recommandé.</p>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={withdrawalMutation.isPending}
              >
                {withdrawalMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  "Confirmer le retrait"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
