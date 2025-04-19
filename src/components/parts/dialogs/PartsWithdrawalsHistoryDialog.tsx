
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPartWithdrawals, PartWithdrawal } from '@/services/supabase/parts/getPartWithdrawals';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Package, Loader2, CalendarDays, Info } from 'lucide-react';

interface PartsWithdrawalsHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  partId?: number;
}

const PartsWithdrawalsHistoryDialog = ({
  isOpen,
  onOpenChange,
  partId
}: PartsWithdrawalsHistoryDialogProps) => {
  const [withdrawals, setWithdrawals] = useState<PartWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWithdrawals = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getPartWithdrawals(partId);
        setWithdrawals(data);
      } catch (err) {
        console.error('Erreur lors du chargement des retraits:', err);
        setError("Impossible de charger l'historique des retraits");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWithdrawals();
  }, [isOpen, partId]);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPP à HH:mm', { locale: fr });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Historique des retraits de pièces
            {partId && <span className="text-muted-foreground ml-2 text-sm">
              (Filtre: pièce #{partId})
            </span>}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>Chargement de l'historique...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive flex items-center">
            <Info className="h-5 w-5 mr-2" />
            {error}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <h3 className="font-medium text-lg">Aucun retrait trouvé</h3>
            <p className="text-muted-foreground">
              Aucun historique de retrait disponible {partId ? "pour cette pièce" : ""}
            </p>
          </div>
        ) : (
          <Table>
            <TableCaption>Historique des retraits de pièces</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Pièce</TableHead>
                <TableHead className="text-center">Quantité</TableHead>
                <TableHead>Équipement</TableHead>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((withdrawal) => (
                <TableRow key={withdrawal.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(withdrawal.withdrawn_at)}
                  </TableCell>
                  <TableCell>{withdrawal.part_name || `#${withdrawal.part_id}`}</TableCell>
                  <TableCell className="text-center">{withdrawal.quantity}</TableCell>
                  <TableCell>
                    {withdrawal.equipment_name || 
                      (withdrawal.equipment_id ? `#${withdrawal.equipment_id}` : '-')}
                  </TableCell>
                  <TableCell>{withdrawal.user_name || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {withdrawal.notes || '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PartsWithdrawalsHistoryDialog;
