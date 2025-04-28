
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface PartCompatibilityProps {
  compatibility: number[];
}

interface EquipmentInfo {
  id: number;
  name: string;
}

const PartCompatibility: React.FC<PartCompatibilityProps> = ({ compatibility }) => {
  // Ensure compatibility is always an array of numbers
  const safeCompatibility = Array.isArray(compatibility) ? compatibility : [];
  
  // Utilisation de React Query pour charger les informations des équipements
  const { data: equipmentInfo, isLoading, error } = useQuery({
    queryKey: ['equipment-compatibility', safeCompatibility],
    queryFn: async (): Promise<EquipmentInfo[]> => {
      if (!safeCompatibility.length) return [];
      
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name')
          .in('id', safeCompatibility);
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Erreur lors du chargement des équipements compatibles:', err);
        return [];
      }
    },
    enabled: safeCompatibility.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Équipements manquants (qui ont été supprimés mais sont toujours référencés)
  const missingEquipmentIds = React.useMemo(() => {
    if (!equipmentInfo || !safeCompatibility.length) return [];
    
    const foundIds = new Set(equipmentInfo.map(eq => eq.id));
    return safeCompatibility.filter(id => !foundIds.has(id));
  }, [equipmentInfo, safeCompatibility]);

  return (
    <div>
      <h3 className="text-sm text-muted-foreground mb-2">Équipements compatibles</h3>
      
      {isLoading ? (
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {equipmentInfo && equipmentInfo.length > 0 ? (
            equipmentInfo.map((equipment) => (
              <Badge key={equipment.id} variant="secondary" className="px-2 py-1">
                {equipment.name}
              </Badge>
            ))
          ) : safeCompatibility.length === 0 ? (
            <span className="text-sm text-muted-foreground">Aucun équipement compatible</span>
          ) : error ? (
            <span className="text-sm text-destructive">Erreur de chargement des compatibilités</span>
          ) : null}
          
          {/* Afficher les équipements supprimés */}
          {missingEquipmentIds.length > 0 && (
            <>
              {missingEquipmentIds.map((id) => (
                <Badge key={id} variant="outline" className="px-2 py-1 border-destructive text-destructive">
                  Équipement supprimé (ID: {id})
                </Badge>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PartCompatibility;
