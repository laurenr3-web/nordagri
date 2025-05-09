
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PartsMobileViewProps {
  parts: Part[];
  selectedParts: (string | number)[];
  onSelectPart: (partId: string | number, selected: boolean) => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog?: (part: Part) => void;
  openWithdrawalDialog?: (part: Part) => void;
  getStockStatusColor: (part: Part) => string;
  animatingOut?: (string | number)[];
}

export const PartsMobileView: React.FC<PartsMobileViewProps> = ({
  parts,
  selectedParts,
  onSelectPart,
  openPartDetails,
  openOrderDialog,
  openWithdrawalDialog,
  getStockStatusColor,
  animatingOut = []
}) => {
  return (
    <div className="block sm:hidden space-y-4">
      {parts.map(part => {
        const isAnimatingOut = animatingOut?.includes(part.id);
        
        return (
          <Card 
            key={part.id} 
            className={`${isAnimatingOut ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1 cursor-pointer" onClick={() => openPartDetails(part)}>
                  <h3 className="font-medium">{part.name}</h3>
                  <p className="text-sm text-muted-foreground">{part.partNumber}</p>
                </div>
                <Badge variant="outline" className={getStockStatusColor(part)}>
                  Stock: {part.stock}
                </Badge>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Emplacement: {part.location}</span>
                <span>Prix: {part.price?.toFixed(2)} €</span>
              </div>
            </CardContent>
            
            <CardFooter className="px-4 pb-4 pt-0 flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => openPartDetails(part)}
              >
                Détails
              </Button>
              
              {openWithdrawalDialog && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => openWithdrawalDialog(part)}
                >
                  Retirer
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
      
      {parts.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune pièce trouvée
        </div>
      )}
    </div>
  );
};
