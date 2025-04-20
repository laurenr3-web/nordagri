
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusText, getStatusColor } from '../utils/statusUtils';
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
import QRCodeGenerator from '../qr/QRCodeGenerator';

interface EquipmentHeaderProps {
  equipment: any;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ equipment, onEditClick, onDeleteClick }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{equipment.name}</h1>
          <Badge className={getStatusColor(equipment.status)} variant="secondary">
            {getStatusText(equipment.status)}
          </Badge>
        </div>
        
        <div className="text-muted-foreground mt-1">
          {equipment.manufacturer && equipment.model ? (
            <p>{equipment.manufacturer} {equipment.model} {equipment.year && `(${equipment.year})`}</p>
          ) : (
            <p>{equipment.type || 'Équipement'} {equipment.year && `(${equipment.year})`}</p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2 self-start">
        <QRCodeGenerator equipmentId={equipment.id} equipmentName={equipment.name} />
        
        <Button variant="outline" size="sm" onClick={onEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
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
                onClick={onDeleteClick}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EquipmentHeader;
