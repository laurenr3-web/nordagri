
import React from 'react';
import { ListChecks } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface CompatibleEquipmentSectionProps {
  partNumber: string;
  equipment: number[] | null | undefined;
}

interface EquipmentInfo {
  id: number;
  name: string;
}

export const CompatibleEquipmentSection: React.FC<CompatibleEquipmentSectionProps> = ({ 
  partNumber, 
  equipment 
}) => {
  const equipmentIds = Array.isArray(equipment) ? equipment : [];
  
  // Récupérer les noms des équipements depuis leurs IDs
  const { data: equipmentInfo, isLoading } = useQuery({
    queryKey: ['compatible-equipment', equipmentIds],
    queryFn: async (): Promise<EquipmentInfo[]> => {
      if (!equipmentIds.length) return [];
      
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name')
          .in('id', equipmentIds);
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error('Erreur lors du chargement des équipements compatibles:', err);
        return [];
      }
    },
    enabled: equipmentIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
  
  // Pour les équipements non trouvés, gérer le fallback
  const getEquipmentDisplay = () => {
    if (isLoading || !equipmentInfo) return null;
    
    if (equipmentInfo.length === 0 && equipmentIds.length > 0) {
      // Aucun équipement trouvé mais des IDs étaient présents
      return (
        <ul className="list-disc pl-5 space-y-1">
          {equipmentIds.map(id => (
            <li key={id}>ID #{id} (équipement non trouvé)</li>
          ))}
        </ul>
      );
    }
    
    if (equipmentInfo.length > 0) {
      // Map pour accéder rapidement aux équipements trouvés
      const equipmentMap = new Map(equipmentInfo.map(e => [e.id, e.name]));
      
      return (
        <ul className="list-disc pl-5 space-y-1">
          {equipmentIds.map(id => (
            <li key={id}>
              {equipmentMap.has(id) 
                ? equipmentMap.get(id) 
                : `ID #${id} (non trouvé)`}
            </li>
          ))}
        </ul>
      );
    }
    
    return null;
  };
  
  const hasEquipment = equipmentIds && equipmentIds.length > 0;

  return (
    <BaseSectionCard
      title="Équipements compatibles"
      icon={ListChecks}
      partNumber={partNumber}
      description={
        hasEquipment ? getEquipmentDisplay() : null
      }
      placeholder={`Aucune information disponible sur les équipements compatibles avec la pièce ${partNumber}`}
    />
  );
};
