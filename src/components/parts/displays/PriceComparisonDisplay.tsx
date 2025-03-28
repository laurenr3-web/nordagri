
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, Check, Clock, XCircle } from 'lucide-react';
import { PriceComparisonItem } from '@/services/perplexity/partsPriceService';

interface PriceComparisonDisplayProps {
  data: PriceComparisonItem[] | null;
}

export const PriceComparisonDisplay: React.FC<PriceComparisonDisplayProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune information de prix disponible
      </div>
    );
  }

  // Trier les résultats par prix croissant
  const sortedData = [...data].sort((a, b) => {
    const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
    const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
    return priceA - priceB;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comparaison des prix</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fournisseur</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead className="hidden md:table-cell">Disponibilité</TableHead>
                <TableHead className="hidden md:table-cell">Livraison</TableHead>
                <TableHead className="hidden md:table-cell">État</TableHead>
                <TableHead>Lien</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.vendor}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {typeof item.price === 'number' 
                        ? `${item.price.toFixed(2)} ${item.currency}`
                        : `${item.price} ${item.currency}`}
                    </div>
                    
                    {item.shippingCost && (
                      <div className="text-xs text-muted-foreground">
                        +{typeof item.shippingCost === 'number' 
                        ? `${item.shippingCost.toFixed(2)} ${item.currency}`
                        : `${item.shippingCost} ${item.currency}`} (livraison)
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.availability === 'En stock' ? (
                      <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40">
                        <Check className="h-3 w-3 mr-1" /> {item.availability}
                      </Badge>
                    ) : item.availability === 'Sur commande' ? (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40">
                        <Clock className="h-3 w-3 mr-1" /> {item.availability}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40">
                        <XCircle className="h-3 w-3 mr-1" /> {item.availability}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.estimatedDelivery}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.condition || 'Neuf'}
                  </TableCell>
                  <TableCell>
                    {item.url ? (
                      <a 
                        href={item.url} 
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="mt-4 text-xs text-muted-foreground">
            Dernière mise à jour: {new Date(sortedData[0].lastUpdated).toLocaleString()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
