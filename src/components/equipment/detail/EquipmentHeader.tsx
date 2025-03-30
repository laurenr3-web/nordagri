
import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EquipmentItem } from '../hooks/useEquipmentFilters';

interface EquipmentHeaderProps {
  equipment: EquipmentItem;
  onEdit: () => void;
}

const EquipmentHeader: React.FC<EquipmentHeaderProps> = ({ equipment, onEdit }) => {
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
        <Button variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>
    </div>
  );
};

export default EquipmentHeader;
