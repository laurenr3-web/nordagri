
import React from 'react';
import NoResultsFound from './NoResultsFound';
import {
  FunctionSection,
  InstallationSection,
  SymptomsSection,
  MaintenanceSection,
  AlternativesSection,
  WarningsSection
} from './technical-sections';

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FunctionSection 
          partNumber={partReference}
          description={data.function || data.description}
        />
        
        <InstallationSection 
          partNumber={partReference}
          description={data.installation || data.mountingInstructions}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SymptomsSection 
          partNumber={partReference}
          description={data.symptoms || data.failureIndicators}
        />
        
        <MaintenanceSection 
          partNumber={partReference}
          description={data.maintenance || data.upkeep}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WarningsSection 
          partNumber={partReference}
          description={data.warnings || data.precautions}
        />
        
        <AlternativesSection 
          partNumber={partReference}
          description={data.alternatives || data.substitutes}
        />
      </div>
    </div>
  );
};
