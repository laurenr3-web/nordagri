
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Loader2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import QRCodeGenerator from '../qr/QRCodeGenerator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EquipmentHeaderProps {
  equipment: EquipmentItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ 
  equipment, 
  onEdit, 
  onDelete,
  isDeleting = false 
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
          <Badge variant="outline" className={equipment.status === 'operational' ? 'bg-green-100' : 
                                              equipment.status === 'maintenance' ? 'bg-yellow-100' : 
                                              equipment.status === 'broken' ? 'bg-red-100' : 'bg-gray-100'}>
            {equipment.status}
          </Badge>
        </div>
        
        <div className="text-muted-foreground mt-1">
          {equipment.manufacturer && equipment.model ? (
            <p>{equipment.manufacturer} {equipment.model} {equipment.year > 0 && `(${equipment.year})`}</p>
          ) : (
            <p>{equipment.type || 'Équipement'} {equipment.year > 0 && `(${equipment.year})`}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 self-start">
        <QRCodeGenerator 
          equipmentId={equipment.id} 
          equipmentName={equipment.name} 
        />
        
        <Button variant="outline" size="sm" onClick={onEdit} disabled={isDeleting}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action ne peut pas être annulée. Cela supprimera définitivement l'équipement 
                "{equipment.name}" et toutes les données associées.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? 'Suppression...' : 'Supprimer'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EquipmentHeader;
