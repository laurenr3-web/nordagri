
import React from 'react';
import NoResultsFound from './NoResultsFound';
import { TechnicalInfoSections } from './technical-sections';

interface TechnicalInfoDisplayProps {
  data: any;
  partReference: string;
  onRetryWithManufacturer?: (manufacturer: string) => void;
}

export const TechnicalInfoDisplay: React.FC<TechnicalInfoDisplayProps> = ({ 
  data, 
  partReference,
  onRetryWithManufacturer
}) => {
  // Si pas de données, afficher une interface pour améliorer la recherche
  if (!data) {
    return (
      <NoResultsFound 
        partReference={partReference} 
        onRetryWithManufacturer={onRetryWithManufacturer}
      />
    );
  }

  // Données techniques disponibles, afficher les sections
  return (
    <div className="space-y-6 py-4">
      <TechnicalInfoSections data={data} partReference={partReference} />
    </div>
  );
};
