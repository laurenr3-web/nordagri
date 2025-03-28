
import React from 'react';
import { Wrench } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface InstallationSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const InstallationSection: React.FC<InstallationSectionProps> = ({ partNumber, description }) => {
  return (
    <BaseSectionCard
      title="Installation & montage"
      icon={Wrench}
      partNumber={partNumber}
      description={description}
      placeholder={`Aucune information disponible sur l'installation de la pièce ${partNumber}`}
    />
  );
};
