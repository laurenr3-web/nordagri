
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Part } from '@/types/Part';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { WithdrawalForm } from './WithdrawalForm';
import { WithdrawalEmptyState } from './WithdrawalEmptyState';

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
  const { withdrawalMutation } = usePartsWithdrawal();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Retirer une pièce</DialogTitle>
        </DialogHeader>
        
        {!part ? <WithdrawalEmptyState onClose={() => onOpenChange(false)} /> : (
          <WithdrawalForm 
            part={part}
            onOpenChange={onOpenChange}
            withdrawalMutation={withdrawalMutation}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;
