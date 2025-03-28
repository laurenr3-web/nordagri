
import React from 'react';
import { Info, Tool, AlertTriangle, HelpCircle, Settings, RotateCcw, ArrowRightLeft, Wrench } from 'lucide-react';
import NoResultsFound from './NoResultsFound';
import { 
  FunctionSection, 
  InstallationSection, 
  SymptomsSection, 
  MaintenanceSection, 
  AlternativesSection, 
  WarningsSection,
  HelpSection,
  InfoSection
} from './TechnicalInfoSections';

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
          data={data.function || data.description} 
          partNumber={partReference}
        />
        
        <InstallationSection 
          data={data.installation || data.mountingInstructions} 
          partNumber={partReference}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SymptomsSection 
          data={data.symptoms || data.failureIndicators} 
          partNumber={partReference}
        />
        
        <MaintenanceSection 
          data={data.maintenance || data.upkeep} 
          partNumber={partReference}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WarningsSection 
          data={data.warnings || data.precautions} 
          partNumber={partReference}
        />
        
        <AlternativesSection 
          data={data.alternatives || data.substitutes} 
          partNumber={partReference}
        />
      </div>
    </div>
  );
};
