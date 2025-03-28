
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartTechnicalInfo } from '@/services/perplexity/partsTechnicalService';

interface TechnicalInfoDisplayProps {
  data: PartTechnicalInfo | null;
  partReference?: string;
}

export const TechnicalInfoDisplay: React.FC<TechnicalInfoDisplayProps> = ({ data, partReference }) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune information technique disponible
      </div>
    );
  }

  // Fonction pour rechercher sur le web
  const searchOnWeb = (reference: string) => {
    window.open(`https://google.com/search?q=${reference}+agricultural+part`, '_blank');
  };

  // Fonction pour vérifier si une information est disponible ou pertinente
  const isInfoAvailable = (info: string): boolean => {
    return !!info && !info.toLowerCase().includes("non disponible") && !info.toLowerCase().includes("information non");
  };

  return (
    <div className="space-y-6">
      {/* Section fonction et utilisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Fonction et utilisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isInfoAvailable(data.function) ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="whitespace-pre-line">{data.function}</p>
              
              {data.compatibleEquipment && data.compatibleEquipment.length > 0 && (
                <>
                  <h4 className="font-medium mt-4 mb-2">Équipements compatibles:</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {data.compatibleEquipment.map((equipment, index) => (
                      <li key={index}>{equipment}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-muted-foreground">
                Information limitée pour cette référence {partReference && `(${partReference})`}
              </p>
              <p className="text-sm mt-2">
                Cette référence pourrait correspondre à une pièce agricole spécifique, 
                mais les détails précis ne sont pas disponibles dans notre base de données.
              </p>
              {partReference && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => searchOnWeb(partReference)}
                >
                  Rechercher sur le web
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Guide d'installation */}
      {isInfoAvailable(data.installation) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wrench className="h-5 w-5 mr-2" />
              Guide d'installation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-line">
              {data.installation}
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptômes de défaillance */}
        {isInfoAvailable(data.symptoms) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Symptômes de défaillance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {data.symptoms}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Entretien et maintenance */}
        {isInfoAvailable(data.maintenance) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wrench className="h-5 w-5 mr-2" />
                Entretien et maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-line">
                {data.maintenance}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      {/* Alternatives possibles */}
      {data.alternatives && data.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              Alternatives possibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {data.alternatives.map((alternative, index) => (
                <li key={index}>{alternative}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
      
      {/* Avertissements importants */}
      {isInfoAvailable(data.warnings) && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800 dark:text-yellow-300">
              <AlertCircle className="h-5 w-5 mr-2" />
              Avertissements importants
            </CardTitle>
          </CardHeader>
          <CardContent className="text-yellow-800 dark:text-yellow-300">
            <div className="whitespace-pre-line">
              {data.warnings}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Section d'aide si la majorité des informations sont manquantes */}
      {(!isInfoAvailable(data.installation) && !isInfoAvailable(data.symptoms) && !isInfoAvailable(data.maintenance)) && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800 dark:text-blue-300">
              <Info className="h-5 w-5 mr-2" />
              Besoin de plus d'informations?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 dark:text-blue-300 mb-4">
              Nous n'avons que des informations limitées sur cette pièce. Vous pouvez:
            </p>
            <div className="flex flex-wrap gap-2">
              {partReference && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => searchOnWeb(partReference)}
                >
                  Rechercher sur Google
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://www.agriexpo.online/fr/', '_blank')}
              >
                Consulter AgriExpo
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://www.agriaffaires.com/pieces-detachees/1/pieces-agricoles.html', '_blank')}
              >
                Voir sur Agriaffaires
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
