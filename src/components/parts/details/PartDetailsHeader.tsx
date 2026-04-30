
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Trash2, MinusCircle, MoreHorizontal } from 'lucide-react';
import { Part } from '@/types/Part';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <div className="w-full max-w-full min-w-0">
      {onBack && (
        <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>

          <div className="hidden sm:flex gap-2 shrink-0">
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

      <div className="flex justify-between items-start gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl font-semibold truncate">{part.name}</h2>
          <p className="text-sm text-muted-foreground truncate">{part.partNumber}</p>
        </div>

        {/* Mobile : un seul bouton menu "..." regroupant toutes les actions */}
        {!onBack && (
          <div className="sm:hidden shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onWithdrawal}>
                  <MinusCircle className="h-4 w-4 mr-2" />
                  Retirer une pièce
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Desktop : bouton "Retirer" visible à droite du titre */}
        <Button
          variant="secondary"
          onClick={onWithdrawal}
          className="hidden sm:flex items-center gap-1 shrink-0"
        >
          <MinusCircle className="h-4 w-4 mr-1" />
          Retirer une pièce
        </Button>
      </div>

      {/* Desktop seulement (sans onBack) : rangée d'actions sous le titre */}
      {!onBack && (
        <div className="hidden sm:flex justify-end gap-2 mt-2">
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
    </div>
  );
};

export default PartDetailsHeader;
