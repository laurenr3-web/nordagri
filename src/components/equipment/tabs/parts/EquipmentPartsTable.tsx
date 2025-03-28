
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
                  
                  {onDeletePart && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm(`Êtes-vous sûr de vouloir supprimer la pièce "${part.name}"?`)) {
                          onDeletePart(part.id);
                        }
                      }}
                      title="Supprimer la pièce"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
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
