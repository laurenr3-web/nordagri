
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info } from 'lucide-react';

interface HelpSectionProps {
  partReference?: string;
  shouldShow: boolean;
}

export const HelpSection: React.FC<HelpSectionProps> = ({ 
  partReference,
  shouldShow
}) => {
  if (!shouldShow) return null;
  
  // Function to search on the web
  const searchOnWeb = (reference: string) => {
    window.open(`https://google.com/search?q=${reference}+agricultural+part`, '_blank');
  };
  
  return (
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
  );
};
