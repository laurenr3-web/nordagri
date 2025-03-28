
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, Wrench, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { partsTechnicalService } from '@/services/perplexity/partsTechnicalService';
import type { PartTechnicalInfo } from '@/services/perplexity/technical';
import { checkApiKey } from '@/services/perplexity/client';
import { TechnicalInfoDisplay } from './displays/TechnicalInfoDisplay';

interface TechnicalInfoTabProps {
  partNumber: string;
  partName?: string;
}

const TechnicalInfoTab = ({ partNumber, partName }: TechnicalInfoTabProps) => {
  const [technicalInfo, setTechnicalInfo] = useState<PartTechnicalInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadTechnicalInfo = async () => {
    if (!partNumber) {
      toast.error('Numéro de pièce manquant');
      setError('Numéro de pièce manquant');
      return;
    }

    // Vérifier si la clé API est configurée
    if (!checkApiKey()) {
      const errorMessage = "Clé API Perplexity manquante. Pour utiliser cette fonctionnalité, veuillez configurer la variable d'environnement VITE_PERPLEXITY_API_KEY.";
      toast.error(errorMessage);
      setError(errorMessage);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await partsTechnicalService.getPartInfo(partNumber, partName);
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

  useEffect(() => {
    if (partNumber) {
      loadTechnicalInfo();
    }
  }, [partNumber]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p className="text-muted-foreground">Recherche des informations techniques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-destructive font-medium">Erreur</p>
        <p className="text-muted-foreground text-center max-w-md mt-2">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={loadTechnicalInfo}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Informations techniques</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Dernière mise à jour: {formatDate(lastUpdated)}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadTechnicalInfo} 
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <TechnicalInfoDisplay data={technicalInfo} partReference={partNumber} />
    </div>
  );
};

export default TechnicalInfoTab;
