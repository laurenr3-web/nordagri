
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, RefreshCw, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getPartPrices, PriceItem } from '@/services/parts/priceComparisonService';

interface PriceComparisonTabProps {
  partNumber: string;
  partName?: string;
  manufacturer?: string;
}

const PriceComparisonTab = ({ partNumber, partName, manufacturer }: PriceComparisonTabProps) => {
  const [priceData, setPriceData] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPriceData = async () => {
    if (!partNumber) {
      toast.error('Numéro de pièce manquant');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getPartPrices(partNumber, manufacturer);
      setPriceData(data);
      setLastUpdated(new Date());
      
      if (data.length === 0) {
        setError("Aucun prix trouvé pour cette référence");
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des prix:', err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (partNumber) {
      loadPriceData();
    }
  }, [partNumber, manufacturer]);

  const formatPrice = (price: number | string, currency: string) => {
    if (typeof price === 'number') {
      return `${price.toFixed(2)} ${currency}`;
    }
    return `${price} ${currency}`;
  };
  
  const handleOpenUrl = (url: string, vendorName: string) => {
    if (!url || url === '#') {
      toast.error(`Lien non disponible pour ${vendorName}`);
      return;
    }
    
    // Traquer l'événement si besoin
    console.log(`Ouverture du lien pour ${vendorName}: ${url}`);
    
    // Ouvrir dans un nouvel onglet
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Comparaison des prix</CardTitle>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour: {lastUpdated.toLocaleString()}
            </span>
          )}
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
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-muted-foreground">Recherche des meilleurs prix en cours...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
            <p className="text-muted-foreground">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => window.open(`https://google.com/search?q=${partNumber}+${manufacturer || ''}+prix`, '_blank')}
            >
              Rechercher sur Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Fournisseur</th>
                    <th className="text-left p-2">Prix</th>
                    <th className="text-left p-2">Disponibilité</th>
                    <th className="text-left p-2">Livraison</th>
                    <th className="text-left p-2">Délai</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {priceData.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{item.vendor}</td>
                      <td className="p-2">
                        <span className="text-green-600 font-bold">
                          {formatPrice(item.price, item.currency)}
                        </span>
                        {index === 0 && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            Meilleur prix
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                          item.availability.toLowerCase().includes('stock') 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.availability.toLowerCase().includes('stock') 
                            ? <Check className="h-3 w-3 mr-1" /> 
                            : <AlertCircle className="h-3 w-3 mr-1" />}
                          {item.availability}
                        </span>
                      </td>
                      <td className="p-2">
                        {typeof item.shipping === 'number' 
                          ? `${item.shipping.toFixed(2)} ${item.currency}` 
                          : item.shipping}
                      </td>
                      <td className="p-2">{item.deliveryTime}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenUrl(item.url, item.vendor)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Voir
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOpenUrl(item.url, item.vendor)}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Acheter
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Note: Les prix et la disponibilité sont indicatifs et peuvent varier. Vérifiez les détails sur le site du vendeur.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceComparisonTab;
