
import React from 'react';
import { PartTechnicalInfo } from '@/services/perplexity/partsTechnicalService';
import { InfoSection } from './TechnicalInfoSections/InfoSection';
import { Info, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import {
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
      <InfoSection 
        title="Fonction et utilisation"
        icon={<Info className="h-5 w-5 mr-2" />}
        content={data.function}
        partNumber={partReference}
      />
      
      {/* Guide d'installation */}
      {isInfoAvailable(data.installation) && (
        <InfoSection 
          title="Guide d'installation"
          icon={<Wrench className="h-5 w-5 mr-2" />}
          content={data.installation}
          partNumber={partReference}
          searchQuery={`${partReference}+installation+guide`}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptômes de défaillance */}
        {isInfoAvailable(data.symptoms) && (
          <InfoSection 
            title="Symptômes de défaillance"
            icon={<AlertCircle className="h-5 w-5 mr-2" />}
            content={data.symptoms}
            partNumber={partReference}
            searchQuery={`${partReference}+problèmes+symptômes`}
          />
        )}
        
        {/* Entretien et maintenance */}
        {isInfoAvailable(data.maintenance) && (
          <InfoSection 
            title="Entretien et maintenance"
            icon={<Wrench className="h-5 w-5 mr-2" />}
            content={data.maintenance}
            partNumber={partReference}
            searchQuery={`${partReference}+maintenance+entretien`}
          />
        )}
      </div>
      
      {/* Alternatives possibles */}
      <AlternativesSection alternatives={data.alternatives || []} />
      
      {/* Avertissements importants */}
      <WarningsSection 
        warnings={data.warnings || ""}
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
