
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Part } from '@/types/Part';
import { useEquipmentNames } from '@/hooks/parts/useEquipmentNames';

interface CompatibleEquipmentProps {
  part: Part;
}

export const CompatibleEquipment: React.FC<CompatibleEquipmentProps> = ({ part }) => {
  const compatibility = Array.isArray(part.compatibility) ? part.compatibility : [];
  
  const equipmentIds = React.useMemo(() => 
    compatibility.filter(id => typeof id === 'number') as number[],
    [compatibility]
  );
  
  const { data: equipmentInfo, isLoading } = useEquipmentNames(equipmentIds);
  
  if (compatibility.length === 0) {
    return <span className="text-xs text-muted-foreground">Aucun</span>;
  }
  
  if (isLoading || !equipmentInfo) {
    return <span className="text-xs text-muted-foreground">Chargement...</span>;
  }
  
  return (
    <div className="flex flex-wrap gap-1">
      {compatibility.map(id => {
        const equipmentName = equipmentInfo.get(Number(id)) || `Équipement non trouvé (ID: ${id})`;
        return (
          <Badge key={id} variant="secondary" className="text-xs">
            {equipmentName}
          </Badge>
        );
      })}
    </div>
  );
};
