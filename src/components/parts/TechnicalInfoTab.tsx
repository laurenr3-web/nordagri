
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, AlertCircle, Wrench, CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { partsTechnicalService, PartTechnicalInfo } from '@/services/perplexity/partsTechnicalService';
import { checkApiKey } from '@/services/perplexity/client';

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

  if (!technicalInfo) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune information technique disponible
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Fonction et utilisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">
            {technicalInfo.function}
          </p>
          
          {technicalInfo.compatibleEquipment && technicalInfo.compatibleEquipment.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Équipements compatibles:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {technicalInfo.compatibleEquipment.map((equipment, index) => (
                  <li key={index}>{equipment}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Guide d'installation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line">
            {technicalInfo.installation}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Symptômes de défaillance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">
              {technicalInfo.symptoms}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Entretien et maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">
              {technicalInfo.maintenance}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {technicalInfo.alternatives && technicalInfo.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Alternatives possibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {technicalInfo.alternatives.map((alternative, index) => (
                <li key={index}>{alternative}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {technicalInfo.warnings && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-300">
              <AlertCircle className="h-5 w-5 mr-2" />
              Avertissements importants
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800 dark:text-yellow-300">
            <div className="whitespace-pre-line">
              {technicalInfo.warnings}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TechnicalInfoTab;
