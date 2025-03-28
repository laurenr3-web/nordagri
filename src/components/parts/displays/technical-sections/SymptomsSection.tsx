
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BaseSectionCard } from './BaseSectionCard';

interface SymptomsSectionProps {
  partNumber: string;
  description: string | null | undefined;
}

export const SymptomsSection: React.FC<SymptomsSectionProps> = ({ partNumber, description }) => {
  return (
    <BaseSectionCard
      title="Symptômes de défaillance"
      icon={AlertTriangle}
      partNumber={partNumber}
      description={description}
      placeholder={`Aucun symptôme de défaillance documenté pour la pièce ${partNumber}`}
      iconColor="text-amber-500"
    />
  );
};
