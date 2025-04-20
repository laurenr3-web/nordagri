
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '../details/StatusBadge';

interface EquipmentHeaderProps {
  equipment: any;
  onEditClick: () => void;
  onDeleteClick: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({
  equipment,
  onEditClick,
  onDeleteClick,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold truncate">{equipment.name}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={equipment.status} />
          <span className="text-sm text-muted-foreground">
            {equipment.manufacturer} {equipment.model}
          </span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={onEditClick}
          className="flex-1 sm:flex-none"
        >
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
        <Button 
          variant="destructive" 
          size="sm"
          onClick={onDeleteClick}
          className="flex-1 sm:flex-none"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </div>
  );
};

export default EquipmentHeader;
