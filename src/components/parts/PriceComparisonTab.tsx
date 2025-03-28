
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { perplexityPartsService } from '@/services/perplexity/parts';
import { PartPriceInfo } from '@/types/Part';

interface PriceComparisonTabProps {
  partNumber: string;
  partName?: string;
}

const PriceComparisonTab = ({ partNumber, partName }: PriceComparisonTabProps) => {
  const [priceData, setPriceData] = useState<PartPriceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPriceData = async () => {
    if (!partNumber) {
      toast.error('Numéro de pièce manquant');
      return;
    }

    setIsLoading(true);
    try {
      const data = await perplexityPartsService.comparePartPrices(partNumber, partName || partNumber);
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
    if (partNumber) {
      loadPriceData();
    }
  }, [partNumber]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Comparaison des prix</CardTitle>
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
            <p className="text-muted-foreground">Recherche des meilleurs prix en cours...</p>
          </div>
        ) : priceData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune information de prix disponible pour cette pièce
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 font-medium text-sm py-2 border-b">
              <div className="md:col-span-1">Fournisseur</div>
              <div className="md:col-span-1">Prix</div>
              <div className="md:col-span-1">Livraison</div>
              <div className="md:col-span-1">Disponibilité</div>
              <div className="md:col-span-2">Délai estimé</div>
              <div className="md:col-span-1"></div>
            </div>
            
            {priceData.map((price, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 text-sm py-4 border-b last:border-0">
                <div className="md:col-span-1 font-medium">{price.vendor}</div>
                <div className="md:col-span-1">
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {typeof price.price === 'number' 
                      ? `${price.price.toFixed(2)} ${price.currency}`
                      : `${price.price} ${price.currency}`}
                  </span>
                </div>
                <div className="md:col-span-1">
                  {price.shippingCost 
                    ? (typeof price.shippingCost === 'number' 
                      ? `${price.shippingCost.toFixed(2)} ${price.currency}`
                      : `${price.shippingCost}`)
                    : 'Non précisé'}
                </div>
                <div className="md:col-span-1">
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      price.availability.toLowerCase().includes('stock') 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                        : price.availability.toLowerCase().includes('commande')
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                    }`}
                  >
                    {price.availability}
                  </span>
                </div>
                <div className="md:col-span-2">{price.estimatedDelivery}</div>
                <div className="md:col-span-1">
                  {price.url && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open(price.url, '_blank')}
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

export default PriceComparisonTab;
