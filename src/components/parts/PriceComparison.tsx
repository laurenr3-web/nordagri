
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PartPriceInfo } from '@/types/Part';
import { partsSearchService } from '@/services/perplexity/partsSearchService';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface PriceComparisonProps {
  partReference: string;
  partName: string;
}

const PriceComparison = ({ partReference, partName }: PriceComparisonProps) => {
  const [priceData, setPriceData] = useState<PartPriceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPriceData = async () => {
    setIsLoading(true);
    try {
      const data = await partsSearchService.comparePartPrices(partReference, partName);
      setPriceData(data);
      setLastUpdated(new Date());
      
      if (data.length === 0) {
        toast.info('Aucune information de prix trouvée pour cette pièce');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des prix:', error);
      toast.error('Erreur lors de la comparaison des prix', {
        description: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (partReference && partName) {
      loadPriceData();
    }
  }, [partReference, partName]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleString();
  };

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Comparaison de prix</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Dernière mise à jour: {formatDate(lastUpdated)}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={loadPriceData} 
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-muted-foreground">Recherche des meilleurs prix...</p>
          </div>
        ) : priceData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune information de prix disponible pour cette pièce
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 font-medium text-sm py-2 border-b">
              <div>Fournisseur</div>
              <div>Prix</div>
              <div>Disponibilité</div>
              <div>Délai de livraison</div>
              <div></div>
            </div>
            
            {priceData.map((price, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 text-sm py-2 border-b last:border-0">
                <div>{price.supplier}</div>
                <div className="font-medium">
                  {typeof price.price === 'number' 
                    ? `${price.price.toFixed(2)} ${price.currency}`
                    : `${price.price} ${price.currency}`}
                </div>
                <div>
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      price.isAvailable 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                    }`}
                  >
                    {price.isAvailable ? 'En stock' : 'Non disponible'}
                  </span>
                </div>
                <div>{price.deliveryTime}</div>
                <div>
                  {price.link && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open(price.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceComparison;
