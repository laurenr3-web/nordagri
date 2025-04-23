
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Part } from '@/types/Part';
import { useToast } from '@/hooks/use-toast';
import { useDeletePart } from '@/hooks/parts';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface EquipmentPartsTableProps {
  parts: Part[];
  onEditPart: (part: Part) => void;
  onDeletePart?: (partId: number | string) => void;
}

const EquipmentPartsTable: React.FC<EquipmentPartsTableProps> = ({ 
  parts, 
  onEditPart,
  onDeletePart
}) => {
  const { toast } = useToast();
  const deletePartMutation = useDeletePart();
  const [deletingPart, setDeletingPart] = React.useState<{id: number | string, name: string} | null>(null);

  const openDeleteDialog = (partId: number | string, partName: string) => {
    setDeletingPart({ id: partId, name: partName });
  };

  const handleDeletePart = async () => {
    if (!deletingPart) return;
    
    try {
      if (onDeletePart) {
        await onDeletePart(deletingPart.id);
        toast({
          title: "Pièce supprimée",
          description: `La pièce "${deletingPart.name}" a été supprimée avec succès`,
        });
      } else {
        await deletePartMutation.mutateAsync(deletingPart.id);
      }
      
      // Refresh page after deletion to ensure UI is updated
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de la pièce",
        variant: "destructive",
      });
    } finally {
      setDeletingPart(null);
    }
  };

  const cancelDelete = () => {
    setDeletingPart(null);
  };

  if (parts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Aucune pièce compatible trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <Table className="min-w-[900px]">
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Nom</TableHead>
            <TableHead>N° de pièce</TableHead>
            <TableHead>Fabricant</TableHead>
            <TableHead>Catégorie</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map((part) => (
            <TableRow key={part.id}>
              <TableCell>
                <div className="h-10 w-10 rounded-md overflow-hidden">
                  <img 
                    src={part.image} 
                    alt={part.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Set a default image if the part image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/100x100/png?text=No+Image';
                    }}
                  />
                </div>
              </TableCell>
              <TableCell className="font-medium">{part.name}</TableCell>
              <TableCell>{part.partNumber}</TableCell>
              <TableCell>{part.manufacturer}</TableCell>
              <TableCell>
                <Badge variant="outline">{part.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={part.stock <= part.reorderPoint ? "destructive" : "secondary"}
                >
                  {part.stock}
                </Badge>
              </TableCell>
              <TableCell>{part.price.toFixed(2)} €</TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditPart(part)}
                    title="Modifier la pièce"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openDeleteDialog(part.id, part.name)}
                    title="Supprimer la pièce"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingPart} onOpenChange={(open) => !open && setDeletingPart(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action ne peut pas être annulée. {deletingPart?.name} sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePart}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EquipmentPartsTable;
