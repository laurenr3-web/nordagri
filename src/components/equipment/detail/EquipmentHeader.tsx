
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import QRCodeGenerator from '../qr/QRCodeGenerator';
import DeleteEquipmentDialog from './DeleteEquipmentDialog';

interface EquipmentHeaderProps {
  equipment: EquipmentItem;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ 
  equipment, 
  onEdit, 
  onDelete,
  isDeleting = false,
  canEdit = true,
  canDelete = true,
}) => {
  return (
    <div className="flex flex-col gap-3 mb-4">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{equipment.name}</h1>
          <Badge variant="outline" className={equipment.status === 'operational' ? 'bg-green-100' : 
                                              equipment.status === 'maintenance' ? 'bg-yellow-100' : 
                                              equipment.status === 'broken' ? 'bg-red-100' : 'bg-gray-100'}>
            {equipment.status}
          </Badge>
        </div>
        
        <div className="text-sm text-muted-foreground mt-0.5">
          {equipment.manufacturer && equipment.model ? (
            <p>{equipment.manufacturer} {equipment.model} {equipment.year > 0 && `(${equipment.year})`}</p>
          ) : (
            <p>{equipment.type || 'Équipement'} {equipment.year > 0 && `(${equipment.year})`}</p>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <span data-tour="equipment-qr">
          <QRCodeGenerator 
            equipmentId={equipment.id} 
            equipmentName={equipment.name} 
          />
        </span>
        
        {canEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} disabled={isDeleting}>
            <Edit className="mr-1.5 h-4 w-4" />
            Modifier
          </Button>
        )}
        
        {canDelete && (
          <DeleteEquipmentDialog
            equipmentId={equipment.id}
            equipmentName={equipment.name}
            isDeleting={isDeleting}
            onConfirm={onDelete}
          />
        )}
      </div>
    </div>
  );
};

export default EquipmentHeader;
