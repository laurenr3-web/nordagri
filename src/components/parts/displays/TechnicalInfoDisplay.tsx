
import React from 'react';
import { PartTechnicalInfo } from '@/services/perplexity/partsTechnicalService';
import {
  FunctionSection,
  InstallationSection,
  SymptomsSection,
  MaintenanceSection,
  AlternativesSection,
  WarningsSection,
  HelpSection
} from './TechnicalInfoSections';

interface TechnicalInfoDisplayProps {
  data: PartTechnicalInfo | null;
  partReference?: string;
}

export const TechnicalInfoDisplay: React.FC<TechnicalInfoDisplayProps> = ({ 
  data, 
  partReference 
}) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune information technique disponible
      </div>
    );
  }

  // Fonction pour vérifier si une information est disponible ou pertinente
  const isInfoAvailable = (info: string): boolean => {
    return !!info && !info.toLowerCase().includes("non disponible") && !info.toLowerCase().includes("information non");
  };

  // Vérifier si les informations principales sont manquantes
  const mainInfoMissing = !isInfoAvailable(data.installation) && 
                          !isInfoAvailable(data.symptoms) && 
                          !isInfoAvailable(data.maintenance);

  return (
    <div className="space-y-6">
      {/* Section fonction et utilisation */}
      <FunctionSection 
        functionInfo={data.function}
        compatibleEquipment={data.compatibleEquipment}
        partReference={partReference}
        isInfoAvailable={isInfoAvailable}
      />
      
      {/* Guide d'installation */}
      <InstallationSection 
        installation={data.installation}
        isInfoAvailable={isInfoAvailable}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptômes de défaillance */}
        <SymptomsSection 
          symptoms={data.symptoms}
          isInfoAvailable={isInfoAvailable}
        />
        
        {/* Entretien et maintenance */}
        <MaintenanceSection 
          maintenance={data.maintenance}
          isInfoAvailable={isInfoAvailable}
        />
      </div>
      
      {/* Alternatives possibles */}
      <AlternativesSection alternatives={data.alternatives} />
      
      {/* Avertissements importants */}
      <WarningsSection 
        warnings={data.warnings}
        isInfoAvailable={isInfoAvailable}
      />
      
      {/* Section d'aide si la majorité des informations sont manquantes */}
      <HelpSection 
        partReference={partReference}
        shouldShow={mainInfoMissing}
      />
    </div>
  );
};
