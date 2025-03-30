
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useEquipmentParts } from '@/hooks/equipment/useEquipmentParts';
import { Equipment } from '@/services/supabase/equipmentService';

interface EquipmentPartsAssociationProps {
  equipment: Equipment;
  onAddPart: () => void;
}

const EquipmentPartsAssociation: React.FC<EquipmentPartsAssociationProps> = ({
  equipment,
  onAddPart
}) => {
  const { parts, loading } = useEquipmentParts(equipment);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pièces associées</h3>
          <p className="text-sm text-muted-foreground">
            {loading 
              ? 'Chargement des pièces...' 
              : `${parts.length} pièce(s) compatible(s) avec cet équipement`}
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
