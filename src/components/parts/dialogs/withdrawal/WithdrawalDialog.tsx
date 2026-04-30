
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Part } from '@/types/Part';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { WithdrawalForm } from './WithdrawalForm';
import { WithdrawalPartPicker } from './WithdrawalPartPicker';

interface WithdrawalDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
  parts?: Part[];
  onSelectPart?: (part: Part) => void;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  isOpen,
  onOpenChange,
  part,
  parts = [],
  onSelectPart,
}) => {
  const { withdrawalMutation } = usePartsWithdrawal();
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-24px)] sm:max-w-[500px] max-h-[calc(100vh-24px)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{part ? 'Retirer une pièce' : 'Sélectionner une pièce à retirer'}</DialogTitle>
        </DialogHeader>
        
        {!part ? (
          <WithdrawalPartPicker
            parts={parts}
            onSelect={(p) => onSelectPart?.(p)}
            onClose={() => onOpenChange(false)}
          />
        ) : (
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
