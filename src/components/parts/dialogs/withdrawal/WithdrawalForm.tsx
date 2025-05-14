
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Part } from '@/types/Part';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePartsWithdrawal, WITHDRAWAL_REASONS, PartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { ReasonSelector } from './ReasonSelector';
import { InterventionSelector } from './InterventionSelector';
import { LowStockWarning } from './LowStockWarning';

interface WithdrawalFormProps {
  part: Part;
  onOpenChange: (open: boolean) => void;
  withdrawalMutation: any;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ 
  part, 
  onOpenChange,
  withdrawalMutation
}) => {
  const { interventions } = usePartsWithdrawal();
  
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
    setQuantity(1);
    setReason('');
    setCustomReason('');
    setInterventionId('none');
    setComment('');
    setErrors({});
  }, [part]);

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
    
    if (!validateForm()) {
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

  return (
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
      <ReasonSelector 
        reason={reason} 
        setReason={setReason} 
        customReason={customReason}
        setCustomReason={setCustomReason}
        errors={errors}
      />
      
      {/* Association à une intervention existante */}
      <InterventionSelector 
        interventionId={interventionId}
        setInterventionId={setInterventionId}
        interventions={interventions}
      />
      
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
        <LowStockWarning />
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
  );
};
