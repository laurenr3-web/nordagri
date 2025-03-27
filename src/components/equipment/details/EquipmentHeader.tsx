
import React from 'react';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import StatusBadge from './StatusBadge';

interface EquipmentHeaderProps {
  equipment: EquipmentItem;
  onEditClick: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ equipment, onEditClick }) => {
  return (
    <>
      <div className="relative aspect-video overflow-hidden rounded-md">
        <img 
          src={equipment.image} 
          alt={equipment.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2">
          <StatusBadge status={equipment.status} />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">{equipment.name}</h2>
          <p className="text-muted-foreground">
            {equipment.manufacturer} • {equipment.model} • {equipment.year}
          </p>
        </div>
        <Button 
          onClick={onEditClick} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
        >
          <Pencil size={16} />
          Modifier
        </Button>
      </div>
    </>
  );
};

export default EquipmentHeader;
