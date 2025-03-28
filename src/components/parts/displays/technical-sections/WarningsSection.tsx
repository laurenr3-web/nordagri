
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface WarningsSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const WarningsSection: React.FC<WarningsSectionProps> = ({ partNumber, description }) => {
  return (
    <BaseSectionCard
      title="Avertissements"
      icon={AlertTriangle}
      partNumber={partNumber}
      description={description}
      placeholder={`Aucun avertissement spécifique pour la pièce ${partNumber}`}
      iconColor="text-red-500"
    />
  );
};
