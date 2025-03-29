
import React, { useState, useEffect } from 'react';
import { Part } from '@/types/Part';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPartPrices, PriceItem } from '@/services/parts/priceComparisonService';
import { toast } from 'sonner';

interface PriceComparisonProps {
  part: Part;
}

const PriceComparison: React.FC<PriceComparisonProps> = ({ part }) => {
  const [priceData, setPriceData] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const loadPriceData = async () => {
    if (!part.partNumber) {
      toast.error('Référence de pièce manquante');
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await getPartPrices(part.partNumber, part.manufacturer);
      setPriceData(data);
      setLastUpdated(new Date());
      
      if (data.length === 0) {
        toast.info('Aucune information de prix trouvée');
      }
    } catch (error) {
      console.error('Erreur de récupération des prix:', error);
      toast.error('Erreur lors de la récupération des prix', {
        description: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPriceData();
  }, [part.partNumber, part.manufacturer]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Comparaison de prix</CardTitle>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Dernière mise à jour: {lastUpdated ? lastUpdated.toLocaleString() : 'Jamais'}
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
            Aucune information de prix disponible
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-4 font-medium text-sm py-2 border-b">
              <div>Fournisseur</div>
              <div>Prix</div>
              <div>Disponibilité</div>
              <div>Délai estimé</div>
              <div></div>
            </div>
            
            {priceData.map((price, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 text-sm py-2 border-b last:border-0">
                <div className="font-medium">{price.vendor}</div>
                <div className="text-green-600 font-bold">
                  {typeof price.price === 'number' 
                    ? `${price.price.toFixed(2)} ${price.currency}`
                    : `${price.price} ${price.currency}`}
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    price.availability.toLowerCase().includes('stock') 
                      ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300'
                  }`}>
                    {price.availability}
                  </span>
                </div>
                <div>{price.deliveryTime}</div>
                <div>
                  {price.url && price.url !== '#' && (
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

export default PriceComparison;
