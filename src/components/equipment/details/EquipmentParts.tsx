
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useParts } from '@/hooks/useParts';

interface EquipmentPartsProps {
  equipment: EquipmentItem;
}

const EquipmentParts: React.FC<EquipmentPartsProps> = ({ equipment }) => {
  const { parts } = useParts();
  
  // Filter parts compatible with this equipment
  const compatibleParts = React.useMemo(() => {
    if (!parts || parts.length === 0) return [];
    
    const equipmentId = typeof equipment.id === 'string' 
      ? parseInt(equipment.id, 10) 
      : equipment.id;

    return parts.filter(part => {
      const compatibility = Array.isArray(part.compatibility) ? part.compatibility : [];
      return compatibility.includes(equipmentId);
    });
  }, [parts, equipment.id]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pièces détachées</CardTitle>
      </CardHeader>
      <CardContent>
        {compatibleParts.length > 0 ? (
          <div className="space-y-2">
            <p>Ce matériel possède {compatibleParts.length} pièce(s) compatible(s):</p>
            <ul className="list-disc pl-5">
              {compatibleParts.map(part => (
                <li key={part.id}>{part.name}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-muted-foreground">
            Aucune pièce détachée n'est associée à cet équipement pour le moment.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
