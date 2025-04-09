
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { Equipment } from '@/hooks/equipment/useEquipmentTable';

interface EquipmentTableProps {
  data: Equipment[];
  isLoading: boolean;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  setPageIndex: (index: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (sorting: any) => void;
  sorting: any;
  onDelete: (id: string | number) => void;
  onUpdate: (id: string | number, data: Partial<Equipment>) => void;
}

const EquipmentTable: React.FC<EquipmentTableProps> = ({
  data,
  isLoading,
  pageCount,
  pageIndex,
  pageSize,
  setPageIndex,
  setPageSize,
  setSorting,
  sorting,
  onDelete,
  onUpdate
}) => {
  // Helper function to determine status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'repair':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Fabricant</TableHead>
            <TableHead>Modèle</TableHead>
            <TableHead>Année</TableHead>
            <TableHead>État</TableHead>
            <TableHead>Localisation</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                Aucun équipement trouvé.
              </TableCell>
            </TableRow>
          ) : (
            data.map((equipment) => (
              <TableRow key={equipment.id}>
                <TableCell className="font-medium">{equipment.name}</TableCell>
                <TableCell>{equipment.type || '-'}</TableCell>
                <TableCell>{equipment.manufacturer || '-'}</TableCell>
                <TableCell>{equipment.model || '-'}</TableCell>
                <TableCell>{equipment.year || '-'}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(equipment.status)} variant="outline">
                    {equipment.status || 'Inconnu'}
                  </Badge>
                </TableCell>
                <TableCell>{equipment.location || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        // Mock edit action for now
                        console.log('Edit', equipment);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(equipment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-4 py-2">
        <div className="text-sm text-muted-foreground">
          Page {pageIndex + 1} sur {pageCount}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
            disabled={pageIndex === 0}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPageIndex(Math.min(pageCount - 1, pageIndex + 1))}
            disabled={pageIndex >= pageCount - 1}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentTable;
