
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';

interface PartCompatibilityProps {
  compatibility: string[] | undefined;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  const { data: equipment, isLoading } = useEquipmentList();

  // Ensure compatibility is always an array and filter for valid equipment IDs only
  const validCompatibility = React.useMemo(() => {
    if (!Array.isArray(compatibility) || !equipment) return [];
    
    // Create a map of equipment for O(1) lookups
    const equipmentMap = new Map(equipment.map(e => [e.id.toString(), e]));
    
    return compatibility
      .filter(id => {
        const exists = equipmentMap.has(id);
        if (!exists) {
          console.warn(`Equipment ID ${id} not found in database`);
        }
        return exists;
      })
      .map(id => equipmentMap.get(id)!);
  }, [compatibility, equipment]);
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <h3 className="text-sm text-muted-foreground mb-2">Chargement des équipements...</h3>
        <div className="h-8 bg-muted rounded-md"></div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm text-muted-foreground mb-2">Équipements compatibles</h3>
      <div className="flex flex-wrap gap-2">
        {validCompatibility.length > 0 ? (
          validCompatibility.map((equipment) => (
            <Badge key={equipment.id} variant="secondary" className="px-2 py-1">
              {equipment.name}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            Aucun équipement compatible enregistré
          </span>
        )}
      </div>
    </div>
  );
};

export default PartCompatibility;
