
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, Box, MinusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CompatibleEquipment } from './CompatibleEquipment';

interface PartsMobileViewProps {
  parts: Part[];
  selectedParts: (string | number)[];
  onSelectPart: (partId: string | number, checked: boolean) => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
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
    <div className="md:hidden divide-y w-full overflow-x-hidden">
      {parts.map((part) => (
        <div 
          key={part.id} 
          className={`p-4 space-y-3 transition-all duration-300 ${
            animatingOut.includes(part.id) ? 'opacity-0 h-0 overflow-hidden p-0' : 'opacity-100'
          }`}
        >
          <div className="flex items-start gap-3">
            <Checkbox
              checked={selectedParts.includes(part.id)}
              onCheckedChange={(checked) => onSelectPart(part.id, !!checked)}
              aria-label={`Sélectionner ${part.name}`}
              className="mt-1"
            />
            <div 
              className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0" 
              onClick={() => openPartDetails(part)}
            >
              <img 
                src={part.image} 
                alt={part.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/100x100/png?text=No+Image';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm break-words">{part.name}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Box className="h-3 w-3" />
                  <span className="text-xs">{part.partNumber}</span>
                </Badge>
                <span className="text-xs text-muted-foreground">{part.manufacturer}</span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-sm font-medium flex items-center gap-1 ${getStockStatusColor(part)}`}>
                  {part.stock} {part.stock <= part.reorderPoint && <AlertCircle size={14} />}
                </span>
                <span className="text-sm font-medium">{part.price.toFixed(2)}€</span>
              </div>
              <div className="mt-2">
                <span className="text-xs text-muted-foreground mr-1">Compatible avec:</span>
                <CompatibleEquipment part={part} />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-2 flex-grow" 
              onClick={() => openPartDetails(part)}
            >
              Détails
            </Button>
            {openWithdrawalDialog && (
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 px-2 flex-grow flex items-center gap-1" 
                onClick={() => openWithdrawalDialog(part)}
              >
                <MinusCircle className="h-3.5 w-3.5" />
                Retirer
              </Button>
            )}
            <Button 
              variant="default" 
              size="sm" 
              className="h-8 px-2 flex-grow" 
              onClick={() => openOrderDialog(part)}
            >
              Commander
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
