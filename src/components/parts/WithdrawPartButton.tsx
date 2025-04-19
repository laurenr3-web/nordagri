
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MinusCircle, History } from 'lucide-react';
import WithdrawPartDialog from './dialogs/WithdrawPartDialog';
import PartsWithdrawalsHistoryDialog from './dialogs/PartsWithdrawalsHistoryDialog';
import { Part } from '@/types/Part';

interface WithdrawPartButtonProps {
  part: Part;
  onWithdrawalSuccess?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  showHistoryButton?: boolean;
}

const WithdrawPartButton: React.FC<WithdrawPartButtonProps> = ({ 
  part, 
  onWithdrawalSuccess, 
  variant = 'default',
  showHistoryButton = true
}) => {
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  
  return (
    <div className="flex gap-2">
      <Button 
        onClick={() => setIsWithdrawDialogOpen(true)}
        variant={variant}
        disabled={part.stock <= 0}
        className="flex items-center gap-2"
      >
        <MinusCircle className="h-4 w-4" />
        Retirer
      </Button>
      
      {showHistoryButton && (
        <Button
          onClick={() => setIsHistoryDialogOpen(true)}
          variant="outline"
          size="icon"
          title="Historique des retraits"
        >
          <History className="h-4 w-4" />
        </Button>
      )}
      
      <WithdrawPartDialog
        isOpen={isWithdrawDialogOpen}
        onOpenChange={setIsWithdrawDialogOpen}
        selectedPart={part}
        onSuccess={onWithdrawalSuccess}
      />
      
      <PartsWithdrawalsHistoryDialog
        isOpen={isHistoryDialogOpen}
        onOpenChange={setIsHistoryDialogOpen}
        part={part}
      />
    </div>
  );
};

export default WithdrawPartButton;
