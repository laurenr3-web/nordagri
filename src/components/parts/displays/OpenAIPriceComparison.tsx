
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Loader2, RefreshCw, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { PriceItem, getPartPrices } from '@/services/parts/priceComparisonService';

interface OpenAIPriceComparisonProps {
  partNumber: string;
  partName?: string;
  manufacturer?: string;
}

const OpenAIPriceComparison: React.FC<OpenAIPriceComparisonProps> = ({ 
  partNumber, 
  partName, 
  manufacturer 
}) => {
  const [priceData, setPriceData] = useState<PriceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadPriceData = async () => {
    if (!partNumber) {
      toast.error('Numéro de pièce manquant');
      return;
    }

    setIsLoading(true);
    try {
      console.log(`Chargement des prix pour ${partNumber} (${manufacturer || 'fabricant inconnu'})`);
      const data = await getPartPrices(partNumber, manufacturer);
      setPriceData(data);
      setLastUpdated(new Date());
      
      if (data.length === 0) {
        toast.info('Aucune information de prix trouvée pour cette pièce');
      } else {
        toast.success(`${data.length} offres trouvées`);
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
  }, [partNumber, manufacturer]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleString();
  };

  // Formater les prix pour l'affichage
  const formatPrice = (price: string | number, currency: string = '€') => {
    if (typeof price === 'string' && (price.includes('€') || price.includes('$'))) {
      return price;
    }
    
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: currency === '$' ? 'USD' : 'EUR' }).format(numericPrice);
    } catch (e) {
      return `${price} ${currency}`;
    }
  };
  
  // Ouvrir l'URL dans un nouvel onglet
  const handleOpenUrl = (url: string, vendorName: string) => {
    if (!url || url === '#') {
      toast.error(`Lien non disponible pour ${vendorName}`);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="mt-2">
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
              <div className="md:col-span-1">Actions</div>
            </div>
            
            {priceData.map((price, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-7 gap-4 text-sm py-4 border-b last:border-0">
                <div className="md:col-span-1 font-medium">{price.vendor}</div>
                <div className="md:col-span-1">
                  <span className={`font-bold ${index === 0 ? 'text-green-600 dark:text-green-400' : ''}`}>
                    {formatPrice(price.price, price.currency)}
                    {index === 0 && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Meilleur prix
                      </span>
                    )}
                  </span>
                </div>
                <div className="md:col-span-1">
                  {price.shipping === 'Gratuit' || price.shipping === 0 ? (
                    <span className="text-green-600">Gratuit</span>
                  ) : (
                    formatPrice(price.shipping || 0, price.currency)
                  )}
                </div>
                <div className="md:col-span-1">
                  <span 
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      (typeof price.availability === 'string' && price.availability.toLowerCase().includes('stock'))
                        ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300' 
                        : (typeof price.availability === 'string' && 
                          (price.availability.toLowerCase().includes('commande') || 
                           price.availability.toLowerCase().includes('délai')))
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300'
                    }`}
                  >
                    {price.availability}
                  </span>
                </div>
                <div className="md:col-span-2">{price.deliveryTime || 'Non précisé'}</div>
                <div className="md:col-span-1 flex gap-1">
                  {price.url && price.url !== '#' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleOpenUrl(price.url, price.vendor)}
                        className="h-8 px-2"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => handleOpenUrl(price.url, price.vendor)}
                        className="h-8 px-2"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            <div className="mt-4 text-xs text-muted-foreground">
              <p>Note: Les prix et la disponibilité sont estimés à titre indicatif uniquement.</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OpenAIPriceComparison;
