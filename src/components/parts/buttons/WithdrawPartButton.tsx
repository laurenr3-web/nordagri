
import React, { useState } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { MinusCircle } from 'lucide-react';
import { WithdrawPartDialog } from '../dialogs/WithdrawPartDialog';
import { Part } from '@/types/Part';

interface WithdrawPartButtonProps extends Omit<ButtonProps, 'onClick'> {
  part: Part;
  onWithdrawalComplete?: () => void;
  equipments?: Array<{ id: number, name: string }>;
  tasks?: Array<{ id: number, title: string }>;
}

export function WithdrawPartButton({
  part,
  onWithdrawalComplete,
  equipments,
  tasks,
  ...buttonProps
}: WithdrawPartButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        disabled={(part.stock || 0) <= 0}
        {...buttonProps}
      >
        <MinusCircle className="h-4 w-4 mr-2" />
        Retirer
      </Button>
      
      <WithdrawPartDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        part={part}
        equipments={equipments}
        tasks={tasks}
        onWithdrawalComplete={onWithdrawalComplete}
      />
    </>
  );
}
