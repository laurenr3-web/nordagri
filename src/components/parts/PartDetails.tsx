
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Part } from '@/types/Part';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
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
import { useDeletePart } from '@/hooks/parts';

interface PartDetailsProps {
  part: Part;
  onEdit?: (part: Part) => void;
  onDelete?: (partId: number | string) => void;
  onDialogClose?: () => void;
  onBack?: () => void;
}

const PartDetails: React.FC<PartDetailsProps> = ({ part, onEdit, onDelete, onDialogClose, onBack }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const deleteMutation = useDeletePart();

  const handleDelete = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(part.id);
    } else {
      // Utiliser la mutation de suppression si aucun gestionnaire n'est fourni
      deleteMutation.mutate(part.id, {
        onSuccess: () => {
          // Fermer le dialogue principal après la suppression réussie
          if (onDialogClose) {
            setTimeout(() => onDialogClose(), 300);
          }
          
          // Rediriger vers la liste des pièces si onBack est fourni
          if (onBack) {
            onBack();
          }
        }
      });
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

  // Nouveau gestionnaire pour ouvrir le dialogue de confirmation de suppression
  const openDeleteDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={openEditDialog}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            <Button 
              variant="destructive" 
              onClick={openDeleteDialog}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      )}

      <PartImage part={part} />

      <div>
        <h2 className="text-2xl font-semibold">{part.name}</h2>
        <p className="text-muted-foreground">{part.partNumber}</p>
      </div>

      {!onBack && <PartActions onEdit={openEditDialog} onDelete={openDeleteDialog} />}

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
