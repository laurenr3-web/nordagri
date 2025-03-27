
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash, Pencil } from 'lucide-react';

interface PartActionsProps {
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

const PartActions: React.FC<PartActionsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onEdit}
        aria-label="Modifier la pièce"
      >
        <Pencil size={16} />
        Modifier
      </Button>
      <Button 
        variant="destructive" 
        size="sm" 
        className="flex items-center gap-1"
        onClick={onDelete}
        aria-label="Supprimer la pièce"
      >
        <Trash size={16} />
        Supprimer
      </Button>
    </div>
  );
};

export default PartActions;
