
import React from 'react';
import { Settings } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface MaintenanceSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({ partNumber, description }) => {
  return (
    <BaseSectionCard
      title="Maintenance & entretien"
      icon={Settings}
      partNumber={partNumber}
      description={description}
      placeholder={`Aucune information disponible sur la maintenance de la pièce ${partNumber}`}
    />
  );
};
