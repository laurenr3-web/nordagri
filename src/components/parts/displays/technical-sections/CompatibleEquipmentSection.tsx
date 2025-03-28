
import React from 'react';
import { ListChecks } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface CompatibleEquipmentSectionProps {
  partNumber: string;
  equipment: string[] | null | undefined;
}

export const CompatibleEquipmentSection: React.FC<CompatibleEquipmentSectionProps> = ({ 
  partNumber, 
  equipment 
}) => {
  const hasEquipment = equipment && equipment.length > 0;

  return (
    <BaseSectionCard
      title="Équipements compatibles"
      icon={ListChecks}
      partNumber={partNumber}
      description={
        hasEquipment 
          ? (
              <ul className="list-disc pl-5 space-y-1">
                {equipment!.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) 
          : null
      }
      placeholder={`Aucune information disponible sur les équipements compatibles avec la pièce ${partNumber}`}
    />
  );
};
