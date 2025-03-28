
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PartPriceInfo } from '@/types/Part';
import { ExternalLink } from 'lucide-react';

interface PriceComparisonDisplayProps {
  data: PartPriceInfo[] | null;
}

export const PriceComparisonDisplay: React.FC<PriceComparisonDisplayProps> = ({ data }) => {
  // Safely handle null/undefined data
  const safeData = Array.isArray(data) ? data : [];
  
  if (safeData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucune information de prix disponible
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Livraison</TableHead>
            <TableHead>Disponibilité</TableHead>
            <TableHead>Délai estimé</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {safeData.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item.vendor || item.supplier}</TableCell>
              <TableCell>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {typeof item.price === 'number' 
                    ? `${item.price.toFixed(2)} ${item.currency}`
                    : `${item.price} ${item.currency}`}
                </span>
              </TableCell>
              <TableCell>
                {item.shippingCost 
                  ? (typeof item.shippingCost === 'number' 
                    ? `${item.shippingCost.toFixed(2)} ${item.currency}`
                    : `${item.shippingCost}`)
                  : 'Non précisé'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={
                    item.isAvailable || 
                    (typeof item.availability === 'string' && 
                     (item.availability.toLowerCase().includes('stock') || 
                      item.availability.toLowerCase().includes('disponible')))
                      ? 'success'
                      : 'outline'
                  }
                >
                  {item.availability || (item.isAvailable ? 'En stock' : 'Non disponible')}
                </Badge>
              </TableCell>
              <TableCell>{item.estimatedDelivery || item.deliveryTime || 'Non précisé'}</TableCell>
              <TableCell className="text-right">
                {(item.url || item.link) && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => window.open(item.url || item.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
