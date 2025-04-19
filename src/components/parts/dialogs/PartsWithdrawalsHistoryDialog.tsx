
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  getPartWithdrawals,
  getWithdrawalsForPart 
} from '@/services/supabase/parts/getPartWithdrawals';
import { PartWithdrawal } from '@/types/PartWithdrawal';
import { formatDate } from '@/utils/formatters';
import { Part } from '@/types/Part';

interface PartsWithdrawalsHistoryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part?: Part | null;
}

export function PartsWithdrawalsHistoryDialog({
  isOpen,
  onOpenChange,
  part
}: PartsWithdrawalsHistoryDialogProps) {
  const [withdrawals, setWithdrawals] = useState<PartWithdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    async function fetchWithdrawals() {
      setIsLoading(true);
      try {
        let data: PartWithdrawal[];
        
        if (part) {
          // Get withdrawals for specific part
          data = await getWithdrawalsForPart(part.id);
        } else {
          // Get all withdrawals
          data = await getPartWithdrawals();
        }
        
        setWithdrawals(data);
      } catch (error) {
        console.error('Error fetching withdrawal history:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchWithdrawals();
  }, [isOpen, part]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {part ? `Historique des retraits - ${part.name}` : 'Historique des retraits de pièces'}
          </DialogTitle>
          <DialogDescription>
            Liste des retraits de pièces effectués
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucun retrait enregistré
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  {!part && <TableHead>Pièce</TableHead>}
                  <TableHead>Quantité</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Équipement</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{formatDate(withdrawal.withdrawn_at)}</TableCell>
                    {!part && (
                      <TableCell>{withdrawal.part_name || '-'}</TableCell>
                    )}
                    <TableCell>{withdrawal.quantity}</TableCell>
                    <TableCell>{withdrawal.user_name || '-'}</TableCell>
                    <TableCell>{withdrawal.equipment_name || '-'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {withdrawal.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
