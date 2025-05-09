
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, MinusCircle } from 'lucide-react';
import { Part } from '@/types/Part';

interface PartDetailsHeaderProps {
  part: Part;
  onBack?: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onWithdrawal: (e: React.MouseEvent) => void;
}

const PartDetailsHeader: React.FC<PartDetailsHeaderProps> = ({ 
  part, 
  onBack,
  onEdit,
  onDelete,
  onWithdrawal
}) => {
  return (
    <>
      {onBack && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button 
              variant="destructive" 
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-semibold">{part.name}</h2>
          <p className="text-muted-foreground">{part.partNumber}</p>
        </div>
        
        <Button 
          variant="secondary" 
          onClick={onWithdrawal} 
          className="flex items-center gap-1"
        >
          <MinusCircle className="h-4 w-4 mr-1" />
          Retirer une pièce
        </Button>
      </div>

      {!onBack && (
        <div className="flex justify-end gap-2">
          <Button 
            variant="secondary" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onWithdrawal}
            aria-label="Retirer une pièce"
          >
            <MinusCircle size={16} />
            Retirer une pièce
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onEdit}
            aria-label="Modifier la pièce"
          >
            <Edit size={16} />
            Modifier
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onDelete}
            aria-label="Supprimer la pièce"
          >
            <Trash2 size={16} />
            Supprimer
          </Button>
        </div>
      )}
    </>
  );
};

export default PartDetailsHeader;
