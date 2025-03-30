
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

  const handleDeletePart = async (partId: number | string, partName: string) => {
    if (!onDeletePart && !confirm(`Êtes-vous sûr de vouloir supprimer la pièce "${partName}"?`)) {
      return;
    }

    try {
      if (onDeletePart) {
        onDeletePart(partId);
      } else {
        await deletePartMutation.mutateAsync(partId);
        toast({
          title: "Pièce supprimée",
          description: `La pièce "${partName}" a été supprimée avec succès`,
        });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de la pièce",
        variant: "destructive",
      });
    }
  };

  if (parts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">Aucune pièce compatible trouvée</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
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
                    onClick={() => handleDeletePart(part.id, part.name)}
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
    </div>
  );
};

export default EquipmentPartsTable;
