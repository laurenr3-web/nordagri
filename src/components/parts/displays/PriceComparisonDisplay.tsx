
import React from 'react';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PriceComparisonDisplayProps {
  data: any[] | null;
}

export const PriceComparisonDisplay: React.FC<PriceComparisonDisplayProps> = ({ data }) => {
  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];
  
  if (!safeData || safeData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Aucun prix trouvé</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Nous n'avons pas trouvé de prix comparatifs pour cette pièce. Essayez d'ajouter le fabricant pour préciser la recherche.
        </p>
      </div>
    );
  }

  // Formatter les prix pour l'affichage
  const formatPrice = (price: string | number) => {
    // Si c'est déjà une chaîne formatée avec un symbole de devise, la retourner
    if (typeof price === 'string' && (price.includes('€') || price.includes('$'))) {
      return price;
    }
    
    // Sinon, convertir le nombre en chaîne formatée
    try {
      const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(numericPrice);
    } catch (e) {
      // Si le format n'est pas reconnu, retourner la valeur originale
      return price;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Fournisseur</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Disponibilité</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {safeData.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{item.supplier || item.vendor || '-'}</TableCell>
                <TableCell>{formatPrice(item.price) || '-'}</TableCell>
                <TableCell>{item.availability || (item.isAvailable ? 'En stock' : 'Non disponible')}</TableCell>
                <TableCell className="text-right">
                  {(item.link || item.url) && (
                    <Button variant="ghost" size="sm" className="h-8" onClick={() => window.open(item.link || item.url, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Voir
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
