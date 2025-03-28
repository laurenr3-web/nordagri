
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FunctionSectionProps {
  functionInfo: string;
  compatibleEquipment: string[];
  partReference?: string;
  isInfoAvailable: (info: string) => boolean;
}

export const FunctionSection: React.FC<FunctionSectionProps> = ({ 
  functionInfo, 
  compatibleEquipment, 
  partReference,
  isInfoAvailable
}) => {
  // Function to search on the web
  const searchOnWeb = (reference: string) => {
    window.open(`https://google.com/search?q=${reference}+agricultural+part`, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Info className="h-5 w-5 mr-2" />
          Fonction et utilisation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isInfoAvailable(functionInfo) ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <p className="whitespace-pre-line">{functionInfo}</p>
            
            {compatibleEquipment && compatibleEquipment.length > 0 && (
              <>
                <h4 className="font-medium mt-4 mb-2">Équipements compatibles:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {compatibleEquipment.map((equipment, index) => (
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
  );
};
