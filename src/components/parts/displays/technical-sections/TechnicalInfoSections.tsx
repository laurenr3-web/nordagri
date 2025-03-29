
import React from 'react';
import {
  FunctionSection,
  InstallationSection,
  SymptomsSection,
  MaintenanceSection,
  AlternativesSection,
  WarningsSection
} from './index';

interface TechnicalInfoSectionsProps {
  data: any;
  partReference: string;
}

export const TechnicalInfoSections: React.FC<TechnicalInfoSectionsProps> = ({
  data,
  partReference
}) => {
  return (
    <>
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
    </>
  );
};
