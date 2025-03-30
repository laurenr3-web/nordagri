
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getStatusText, getStatusColor } from '../utils/statusUtils';

interface EquipmentHeaderProps {
  equipment: any;
  onEditClick: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ equipment, onEditClick }) => {
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
        <Button variant="outline" size="sm" onClick={onEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>
    </div>
  );
};

export default EquipmentHeader;
