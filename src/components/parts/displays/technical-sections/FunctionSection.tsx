
import React from 'react';
import { Info } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface FunctionSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const FunctionSection: React.FC<FunctionSectionProps> = ({ partNumber, description }) => {
  return (
    <BaseSectionCard
      title="Fonction & utilisation"
      icon={Info}
      partNumber={partNumber}
      description={description}
      placeholder={`Aucune information disponible sur la fonction de la pièce ${partNumber}`}
    />
  );
};
