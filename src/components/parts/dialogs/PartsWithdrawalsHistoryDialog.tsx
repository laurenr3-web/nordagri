
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartWithdrawal } from '@/types/PartWithdrawal';
import { getWithdrawalsForPart } from '@/services/supabase/parts/getPartWithdrawals';
import { Part } from '@/types/Part';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Loader2 } from 'lucide-react';

interface PartsWithdrawalsHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
}

const PartsWithdrawalsHistoryDialog: React.FC<PartsWithdrawalsHistoryDialogProps> = ({
  isOpen,
  onOpenChange,
  part
}) => {
  const [withdrawals, setWithdrawals] = useState<PartWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen && part) {
      loadWithdrawals();
    }
  }, [isOpen, part]);
  
  const loadWithdrawals = async () => {
    if (!part?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const partId = typeof part.id === 'string' ? parseInt(part.id) : part.id;
      const data = await getWithdrawalsForPart(partId);
      setWithdrawals(data);
    } catch (err: any) {
      console.error('Error loading withdrawals:', err);
      setError(err.message || 'Erreur lors du chargement de l\'historique des retraits');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historique des retraits</DialogTitle>
          <DialogDescription>
            {part ? `Historique des retraits pour ${part.name}` : 'Chargement...'}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button 
              variant="outline" 
              onClick={loadWithdrawals} 
              className="mt-4"
            >
              Réessayer
            </Button>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="py-6 text-center text-muted-foreground">
            <p>Aucun retrait trouvé pour cette pièce</p>
          </div>
        ) : (
          <div className="space-y-4">
            {withdrawals.map(withdrawal => (
              <div 
                key={withdrawal.id} 
                className="border rounded-md p-3 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium">{withdrawal.quantity} unité{withdrawal.quantity > 1 ? 's' : ''}</span>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(withdrawal.withdrawn_at), 'PPP à HH:mm', {locale: fr})}
                    </p>
                  </div>
                  <div className="text-sm text-right">
                    <p>{withdrawal.user_name}</p>
                  </div>
                </div>
                
                {withdrawal.equipment_name && (
                  <div className="text-sm">
                    <span className="font-medium">Équipement:</span> {withdrawal.equipment_name}
                  </div>
                )}
                
                {withdrawal.notes && (
                  <div className="text-sm mt-1">
                    <span className="font-medium">Notes:</span> {withdrawal.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PartsWithdrawalsHistoryDialog;
