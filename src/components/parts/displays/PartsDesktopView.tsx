
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, MinusCircle } from 'lucide-react';
import { CompatibleEquipment } from './CompatibleEquipment';

interface PartsDesktopViewProps {
  parts: Part[];
  selectedParts: (string | number)[];
  onSelectPart: (partId: string | number, checked: boolean) => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
  openWithdrawalDialog?: (part: Part) => void;
  getStockStatusColor: (part: Part) => string;
  animatingOut?: (string | number)[];
}

export const PartsDesktopView: React.FC<PartsDesktopViewProps> = ({
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
    <div className="hidden md:block">
      <table className="w-full">
        <thead>
          <tr className="bg-secondary/50">
            <th className="text-left p-3">
              <span className="sr-only">Sélection</span>
            </th>
            <th className="text-left p-3 font-medium">Image</th>
            <th className="text-left p-3 font-medium">Nom</th>
            <th className="text-left p-3 font-medium">Référence</th>
            <th className="text-left p-3 font-medium">Fabricant</th>
            <th className="text-left p-3 font-medium">Prix</th>
            <th className="text-left p-3 font-medium">Stock</th>
            <th className="text-left p-3 font-medium">Compatible avec</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {parts.map((part) => (
            <tr 
              key={part.id} 
              className={`hover:bg-secondary/30 transition-all duration-300 ${
                animatingOut.includes(part.id) ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              <td className="p-3">
                <Checkbox
                  checked={selectedParts.includes(part.id)}
                  onCheckedChange={(checked) => onSelectPart(part.id, !!checked)}
                  aria-label={`Sélectionner ${part.name}`}
                />
              </td>
              <td className="p-3">
                <div 
                  className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0 cursor-pointer" 
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
              </td>
              <td className="p-3 font-medium">{part.name}</td>
              <td className="p-3">{part.partNumber}</td>
              <td className="p-3">{part.manufacturer}</td>
              <td className="p-3">{part.price.toFixed(2)}€</td>
              <td className="p-3">
                <span className={getStockStatusColor(part)}>
                  {part.stock} {part.stock <= part.reorderPoint && (
                    <AlertCircle size={14} className="inline ml-1" />
                  )}
                </span>
              </td>
              <td className="p-3 max-w-[200px]">
                <CompatibleEquipment part={part} />
              </td>
              <td className="p-3">
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-2" 
                    onClick={() => openPartDetails(part)}
                  >
                    Détails
                  </Button>
                  {openWithdrawalDialog && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="h-8 px-2 flex items-center gap-1" 
                      onClick={() => openWithdrawalDialog(part)}
                    >
                      <MinusCircle className="h-3.5 w-3.5" />
                      Retirer
                    </Button>
                  )}
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="h-8 px-2" 
                    onClick={() => openOrderDialog(part)}
                  >
                    Commander
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
