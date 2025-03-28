
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { PartTechnicalInfo } from '@/services/perplexity/partsTechnicalService';

interface TechnicalInfoDisplayProps {
  data: PartTechnicalInfo | null;
}

export const TechnicalInfoDisplay: React.FC<TechnicalInfoDisplayProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune information technique disponible
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            Fonction et utilisation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-line">
            {data.function}
          </p>
          
          {data.compatibleEquipment && data.compatibleEquipment.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Équipements compatibles:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {data.compatibleEquipment.map((equipment, index) => (
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
            {data.installation}
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
              {data.symptoms}
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
              {data.maintenance}
            </div>
          </CardContent>
        </Card>
      </div>
      
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
      
      {data.warnings && (
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
    </div>
  );
};
