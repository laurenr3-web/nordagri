
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPartInfo } from '@/services/parts/openaiPartService';
import type { PartTechnicalInfo } from '@/services/parts/openaiPartService';
import { TechnicalInfoDisplay } from '../displays/TechnicalInfoDisplay';
import { TechnicalInfoSearch } from './TechnicalInfoSearch';
import { TechnicalInfoHeader } from './TechnicalInfoHeader';
import { TechnicalInfoStatus } from './TechnicalInfoStatus';
import { TechnicalInfoLoading } from './TechnicalInfoLoading';
import { TechnicalInfoError } from './TechnicalInfoError';
import { useOpenAIStatus } from '@/hooks/parts/useOpenAIStatus';

interface TechnicalInfoTabProps {
  partNumber: string;
  partName?: string;
}

const TechnicalInfoTab = ({ partNumber, partName }: TechnicalInfoTabProps) => {
  const openAIStatus = useOpenAIStatus();
  const [technicalInfo, setTechnicalInfo] = useState<PartTechnicalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manufacturer, setManufacturer] = useState<string | null>(null);
  const [currentPartNumber, setCurrentPartNumber] = useState(partNumber);

  const loadTechnicalInfo = async (manufacturerOverride?: string, partNumberOverride?: string) => {
    const usePartNumber = partNumberOverride || currentPartNumber;
    
    if (!usePartNumber) {
      toast.error('Numéro de pièce manquant');
      setError('Numéro de pièce manquant');
      return;
    }

    // Vérifier si la clé API est configurée
    if (!openAIStatus.isApiKeyValid) {
      const errorMessage = openAIStatus.connectionError || openAIStatus.error || 
        "Clé API OpenAI manquante ou invalide. Pour utiliser cette fonctionnalité, veuillez configurer correctement la variable d'environnement VITE_OPENAI_API_KEY.";
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser le fabricant fourni ou celui stocké précédemment
      const currentManufacturer = manufacturerOverride || manufacturer;
      let contextName = partName;
      
      // Ajouter le fabricant au nom de la pièce pour plus de contexte
      if (currentManufacturer) {
        contextName = contextName 
          ? `${contextName} (${currentManufacturer})` 
          : `${usePartNumber} (${currentManufacturer})`;
        
        // Stocker le fabricant pour les prochaines requêtes
        if (manufacturerOverride) {
          setManufacturer(manufacturerOverride);
        }
      }
      
      // Transmettre la référence exactement comme saisie, sans modification
      const data = await getPartInfo(usePartNumber, contextName);
      setTechnicalInfo(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Erreur lors de la récupération des informations techniques:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      toast.error('Erreur lors de la récupération des informations techniques', {
        description: errorMessage
      });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryWithManufacturer = (manufacturerValue: string) => {
    toast.info(`Recherche avec précision: ${manufacturerValue}`);
    loadTechnicalInfo(manufacturerValue);
  };

  const handleComboboxSelect = (value: string) => {
    // Cette logique est maintenant dans TechnicalInfoSearch
    // mais nous mettons à jour le state ici
    setCurrentPartNumber(value);
    loadTechnicalInfo(null, value);
  };

  useEffect(() => {
    if (partNumber && openAIStatus.isApiKeyValid) {
      setCurrentPartNumber(partNumber);
      loadTechnicalInfo();
    }
  }, [partNumber, openAIStatus.isApiKeyValid]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <TechnicalInfoHeader 
          lastUpdated={lastUpdated} 
          formatDate={formatDate}
          onRefresh={() => loadTechnicalInfo()}
          isLoading={isLoading}
          isApiKeyValid={openAIStatus.isApiKeyValid}
        />
        
        <TechnicalInfoSearch 
          currentPartNumber={currentPartNumber}
          onSelect={handleComboboxSelect}
        />
      </div>
      
      <TechnicalInfoStatus 
        openAIStatus={openAIStatus} 
      />
      
      {isLoading ? (
        <TechnicalInfoLoading />
      ) : error ? (
        <TechnicalInfoError 
          error={error} 
          onRetry={() => loadTechnicalInfo()}
          isApiKeyValid={openAIStatus.isApiKeyValid}
        />
      ) : (
        <TechnicalInfoDisplay 
          data={technicalInfo} 
          partReference={currentPartNumber} 
          onRetryWithManufacturer={handleRetryWithManufacturer}
        />
      )}
    </div>
  );
};

export default TechnicalInfoTab;
