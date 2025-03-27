
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Part } from '@/types/Part';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import PartImage from './details/PartImage';
import PartActions from './details/PartActions';
import PartBasicInfo from './details/PartBasicInfo';
import PartInventoryInfo from './details/PartInventoryInfo';
import PartCompatibility from './details/PartCompatibility';
import PartReorderInfo from './details/PartReorderInfo';
import EditPartDialog from './dialogs/EditPartDialog';

interface PartDetailsProps {
  part: Part;
  onEdit?: (part: Part) => void;
  onDelete?: (partId: number) => void;
  onDialogClose?: () => void;
}

const PartDetails: React.FC<PartDetailsProps> = ({ part, onEdit, onDelete, onDialogClose }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(part.id);
    }
    setIsDeleteDialogOpen(false);
  };

  const handleEdit = (updatedPart: Part) => {
    if (onEdit) {
      onEdit(updatedPart);
    }
    
    // Fermer d'abord le dialogue d'édition
    setIsEditDialogOpen(false);
    
    // Puis fermer le dialogue principal après confirmation de la mise à jour
    if (onDialogClose) {
      setTimeout(() => onDialogClose(), 300);
    }
  };

  const openEditDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <PartImage part={part} />

      <div>
        <h2 className="text-2xl font-semibold">{part.name}</h2>
        <p className="text-muted-foreground">{part.partNumber}</p>
      </div>

      <PartActions onEdit={openEditDialog} onDelete={openDeleteDialog} />

      <Separator />
      
      <div className="grid grid-cols-2 gap-6">
        <PartBasicInfo part={part} />
        <PartInventoryInfo part={part} />
      </div>

      <PartCompatibility compatibility={part.compatibility} />

      <PartReorderInfo part={part} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent onClick={e => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. Cette pièce sera supprimée définitivement de notre base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={e => e.stopPropagation()}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Part Dialog */}
      {isEditDialogOpen && (
        <EditPartDialog 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          part={part}
          onSubmit={handleEdit}
          onMainDialogClose={onDialogClose}
        />
      )}
    </div>
  );
};

export default PartDetails;
