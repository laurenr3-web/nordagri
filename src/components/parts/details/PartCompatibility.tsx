
import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { useEquipmentList } from '@/hooks/equipment/useEquipmentList';
import { Skeleton } from '@/components/ui/skeleton';

interface PartCompatibilityProps {
  compatibility: string[];
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Assurer que compatibility est toujours un tableau de chaînes
  const safeCompatibility = Array.isArray(compatibility) 
    ? compatibility.filter(id => id !== null && id !== undefined)
    : [];
  
  // Charger la liste des équipements
  const { data: equipment, isLoading, error } = useEquipmentList();
  
  // Filtrer les équipements compatibles valides et récupérer leurs noms
  const compatibleEquipment = useMemo(() => {
    if (!equipment) return [];
    
    return safeCompatibility
      .map(equipmentId => {
        const found = equipment.find(eq => eq.id === Number(equipmentId));
        return found ? {
          id: found.id,
          name: found.name,
          model: found.model
        } : null;
      })
      .filter(item => item !== null);
  }, [safeCompatibility, equipment]);

  // Afficher un état de chargement
  if (isLoading) {
    return (
      <div>
        <h3 className="text-sm text-muted-foreground mb-2">Compatible Equipment</h3>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error) {
    console.error('Erreur lors du chargement des équipements compatibles:', error);
    return (
      <div>
        <h3 className="text-sm text-muted-foreground mb-2">Compatible Equipment</h3>
        <div className="text-sm text-destructive">
          Erreur lors du chargement des équipements compatibles
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-sm text-muted-foreground mb-2">Compatible Equipment</h3>
      <div className="flex flex-wrap gap-2">
        {compatibleEquipment.length > 0 ? (
          compatibleEquipment.map((eq) => (
            <Badge key={eq.id} variant="secondary" className="px-2 py-1" role="status">
              {eq.name}
              {eq.model && <span className="ml-1 text-xs opacity-70">({eq.model})</span>}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No compatible equipment found</span>
        )}
      </div>
    </div>
  );
};

export default PartCompatibility;
