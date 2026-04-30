
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Package } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

const renderStockBadge = (stock: number) => {
  if (stock === 0) {
    return <Badge variant="destructive">Rupture</Badge>;
  }
  if (stock <= 5) {
    return (
      <Badge className="bg-orange-500/15 text-orange-700 border border-orange-500/30 hover:bg-orange-500/20">
        Faible ({stock})
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/20">
      Stock {stock}
    </Badge>
  );
};

export const PartsMobileView: React.FC<PartsMobileViewProps> = ({
  parts,
  openPartDetails,
  openWithdrawalDialog,
  animatingOut = []
}) => {
  return (
    <div className="block sm:hidden w-full max-w-full overflow-x-hidden space-y-2">
      {parts.map(part => {
        const isAnimatingOut = animatingOut?.includes(part.id);
        const imageSrc = part.imageUrl || part.image || '';

        return (
          <Card
            key={part.id}
            className={`w-full max-w-full p-3 rounded-lg flex flex-col gap-2 cursor-pointer overflow-hidden ${
              isAnimatingOut ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => openPartDetails(part)}
          >
            {/* Header : nom (truncate) + badge stock + menu */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-medium truncate min-w-0 flex-1">
                {part.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {renderStockBadge(part.stock)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        openPartDetails(part);
                      }}
                    >
                      Voir / Modifier
                    </DropdownMenuItem>
                    {openWithdrawalDialog && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            openWithdrawalDialog(part);
                          }}
                        >
                          Retirer du stock
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Image / placeholder */}
            <div className="w-full aspect-[4/3] bg-muted rounded-md overflow-hidden flex items-center justify-center">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={part.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>

            {/* Ligne d'infos : référence · emplacement · prix */}
            <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {part.partNumber && (
                <span className="truncate max-w-[45%]">{part.partNumber}</span>
              )}
              {part.location && (
                <span className="truncate max-w-[45%]">{part.location}</span>
              )}
              {typeof part.price === 'number' && (
                <span className="truncate max-w-[45%] tabular-nums">
                  {part.price.toFixed(2)} €
                </span>
              )}
            </div>
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
