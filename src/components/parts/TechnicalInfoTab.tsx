
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, Wrench, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { getPartInfo } from '@/services/parts/openaiPartService';
import type { PartTechnicalInfo } from '@/services/parts/openaiPartService';
import { checkApiKey } from '@/services/openai/client';
import { TechnicalInfoDisplay } from './displays/TechnicalInfoDisplay';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { useOpenAIStatus } from '@/hooks/parts/useOpenAIStatus';

// Suggestions prédéfinies pour la recherche de pièces techniques
const TECHNICAL_SUGGESTIONS: ComboboxOption[] = [
  { label: "John Deere 0118-2672 - Filtre à huile", value: "JD0118-2672" },
  { label: "Case IH 0118-2672 - Capteur de pression", value: "CASE0118-2672" },
  { label: "Kubota 0118-2672 - Joint d'étanchéité", value: "KUB0118-2672" },
  { label: "John Deere RE504836 - Filtre à carburant", value: "RE504836" },
  { label: "Case IH 84475542 - Filtre à air", value: "84475542" },
];

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
      const errorMessage = "Clé API OpenAI manquante ou invalide. Pour utiliser cette fonctionnalité, veuillez configurer correctement la variable d'environnement VITE_OPENAI_API_KEY.";
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

  const handleRetryWithManufacturer = (manufacturer: string) => {
    toast.info(`Recherche avec précision: ${manufacturer}`);
    loadTechnicalInfo(manufacturer);
  };

  useEffect(() => {
    if (partNumber && openAIStatus.isApiKeyValid) {
      setCurrentPartNumber(partNumber);
      loadTechnicalInfo();
    }
  }, [partNumber, openAIStatus.isApiKeyValid]);

  const handleComboboxSelect = (value: string) => {
    // Extraire les informations de la suggestion
    const suggestion = TECHNICAL_SUGGESTIONS.find(s => s.value === value);
    if (suggestion) {
      // Extraire la référence et le fabricant du libellé
      const parts = suggestion.label.split(' - ')[0].split(' ');
      if (parts.length >= 2) {
        const reference = parts[parts.length - 1];
        const manufacturer = parts.slice(0, parts.length - 1).join(' ');
        
        setCurrentPartNumber(reference);
        setManufacturer(manufacturer);
        loadTechnicalInfo(manufacturer, reference);
      }
    } else {
      // Si la valeur n'est pas dans les suggestions, la traiter comme une référence directe
      setCurrentPartNumber(value);
      // Transmettre la référence exactement comme saisie sans modification
      loadTechnicalInfo(null, value);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold">Informations techniques</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour: {formatDate(lastUpdated)}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => loadTechnicalInfo()} 
              disabled={isLoading || !openAIStatus.isApiKeyValid}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div>
          <Combobox
            options={TECHNICAL_SUGGESTIONS}
            placeholder="Rechercher une pièce..."
            onSelect={handleComboboxSelect}
            defaultValue={currentPartNumber}
            className="w-full md:max-w-md"
          />
        </div>
      </div>
      
      {!openAIStatus.isApiKeyValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Clé API OpenAI manquante ou invalide. Configurez VITE_OPENAI_API_KEY dans .env.development
          </AlertDescription>
        </Alert>
      )}
      
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p className="text-muted-foreground">Recherche des informations techniques...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-8 w-8 text-destructive mb-2" />
          <p className="text-destructive font-medium">Erreur</p>
          <p className="text-muted-foreground text-center max-w-md mt-2">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => loadTechnicalInfo()}
            disabled={!openAIStatus.isApiKeyValid}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        </div>
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
