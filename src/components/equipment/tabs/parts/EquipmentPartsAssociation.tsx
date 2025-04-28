
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Part } from '@/types/Part';

interface EquipmentPartsAssociationProps {
  equipment: Equipment | any;
  onAddPart: () => void;
  parts?: Part[];
}

const EquipmentPartsAssociation: React.FC<EquipmentPartsAssociationProps> = ({
  equipment,
  onAddPart,
  parts = []
}) => {
  const equipmentId = typeof equipment.id === 'string' ? parseInt(equipment.id, 10) : equipment.id;
  const equipmentName = equipment.name || `Équipement #${equipmentId}`;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pièces associées</h3>
          <p className="text-sm text-muted-foreground">
            {parts.length 
              ? `${parts.length} pièce(s) compatible(s) avec ${equipmentName}`
              : `Aucune pièce compatible avec cet équipement: ${equipmentName}`}
          </p>
        </div>
        <Button onClick={onAddPart} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Associer une pièce
        </Button>
      </div>
    </div>
  );
};

export default EquipmentPartsAssociation;
