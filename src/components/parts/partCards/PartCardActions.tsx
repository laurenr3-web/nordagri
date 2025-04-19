
import React from 'react';
import { Button } from '@/components/ui/button';
import { Part } from '@/types/Part';
import { WithdrawPartButton } from '../buttons/WithdrawPartButton';
import { 
  Edit, 
  FileSpreadsheet, 
  ShoppingCart,
  Trash2,
  Copy
} from 'lucide-react';

interface PartCardActionsProps {
  part: Part;
  onView?: (part: Part) => void;
  onEdit?: (part: Part) => void;
  onDelete?: (part: Part) => void;
  onClone?: (part: Part) => void;
  onOrder?: (part: Part) => void;
  onWithdrawalComplete?: () => void;
  className?: string;
  size?: "sm" | "default";
  compact?: boolean;
}

export function PartCardActions({
  part,
  onView,
  onEdit,
  onDelete,
  onClone,
  onOrder,
  onWithdrawalComplete,
  className = "",
  size = "default",
  compact = false
}: PartCardActionsProps) {
  const buttonSize = size === "sm" ? "sm" : "default";
  
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {onView && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => onView(part)}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {compact ? '' : 'Détails'}
        </Button>
      )}
      
      {onEdit && (
        <Button
          variant="outline"
          size={buttonSize}
          onClick={() => onEdit(part)}
        >
          <Edit className="h-4 w-4 mr-2" />
          {compact ? '' : 'Modifier'}
        </Button>
      )}
      
      {onOrder && (
        <Button
          variant="secondary"
          size={buttonSize}
          onClick={() => onOrder(part)}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {compact ? '' : 'Commander'}
        </Button>
      )}
      
      {/* Withdraw Part Button */}
      <WithdrawPartButton 
        part={part}
        size={buttonSize}
        onWithdrawalComplete={onWithdrawalComplete}
        variant={compact ? "ghost" : "outline"}
      >
        {compact ? '' : 'Retirer'}
      </WithdrawPartButton>
      
      {onClone && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => onClone(part)}
        >
          <Copy className="h-4 w-4 mr-2" />
          {compact ? '' : 'Dupliquer'}
        </Button>
      )}
      
      {onDelete && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={() => onDelete(part)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {compact ? '' : 'Supprimer'}
        </Button>
      )}
    </div>
  );
}
