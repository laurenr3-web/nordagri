
import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface AlternativesSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const AlternativesSection: React.FC<AlternativesSectionProps> = ({ partNumber, description }) => {
  return (
    <BaseSectionCard
      title="Alternatives & compatibilité"
      icon={ArrowRightLeft}
      partNumber={partNumber}
      description={description}
      placeholder={`Aucune information disponible sur les alternatives à la pièce ${partNumber}`}
    />
  );
};
