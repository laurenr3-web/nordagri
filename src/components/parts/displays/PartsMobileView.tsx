
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Package, Plus } from 'lucide-react';
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
  openAddStockDialog?: (part: Part) => void;
  getStockStatusColor: (part: Part) => string;
  animatingOut?: (string | number)[];
}

const renderStockBadge = (stock: number) => {
  if (stock === 0) {
    return <Badge variant="destructive" className="shrink-0 max-w-[45%] truncate">Rupture</Badge>;
  }
  if (stock <= 5) {
    return (
      <Badge className="bg-orange-500/15 text-orange-700 border border-orange-500/30 hover:bg-orange-500/20 shrink-0 max-w-[45%] truncate">
        Faible ({stock})
      </Badge>
    );
  }
  return (
    <Badge className="bg-green-500/15 text-green-700 border border-green-500/30 hover:bg-green-500/20 shrink-0 max-w-[45%] truncate">
      Stock {stock}
    </Badge>
  );
};

export const PartsMobileView: React.FC<PartsMobileViewProps> = ({
  parts,
  openPartDetails,
  openWithdrawalDialog,
  openAddStockDialog,
  animatingOut = []
}) => {
  return (
    <div className="block sm:hidden w-full max-w-full overflow-x-hidden box-border space-y-2">
      {parts.map(part => {
        const isAnimatingOut = animatingOut?.includes(part.id);
        const imageSrc = part.imageUrl || part.image || '';

        return (
          <Card
            key={part.id}
            className={`w-full max-w-full box-border p-3 rounded-xl flex flex-col gap-2 cursor-pointer overflow-hidden ${
              isAnimatingOut ? 'opacity-50 pointer-events-none' : ''
            }`}
            onClick={() => openPartDetails(part)}
          >
            {/* Header : nom (truncate) + badge stock + menu */}
            <div className="flex items-start justify-between gap-2 min-w-0">
              <h3 className="text-sm font-semibold truncate min-w-0 flex-1">
                {part.name}
              </h3>
              <div className="flex items-center gap-1 shrink-0 max-w-[60%]">
                {renderStockBadge(part.stock)}
                {openAddStockDialog && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                    title="Ajouter au stock"
                    onClick={(e) => {
                      e.stopPropagation();
                      openAddStockDialog(part);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Ajouter au stock</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
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
                    {openAddStockDialog && (
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          openAddStockDialog(part);
                        }}
                      >
                        Ajouter au stock
                      </DropdownMenuItem>
                    )}
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
            <div className="w-full max-w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
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
                <div className="text-sm text-muted-foreground text-center flex flex-col items-center gap-1">
                  <Package className="h-6 w-6" />
                  <span>Aucune image</span>
                </div>
              )}
            </div>

            {/* Infos pièce : empilées verticalement */}
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground min-w-0">
              {part.partNumber && (
                <div className="flex justify-between gap-2 min-w-0">
                  <span className="shrink-0">Référence</span>
                  <span className="truncate text-foreground">{part.partNumber}</span>
                </div>
              )}
              {part.location && (
                <div className="flex justify-between gap-2 min-w-0">
                  <span className="shrink-0">Emplacement</span>
                  <span className="truncate text-foreground">{part.location}</span>
                </div>
              )}
              {typeof part.price === 'number' && (
                <div className="flex justify-between gap-2 min-w-0">
                  <span className="shrink-0">Prix</span>
                  <span className="truncate text-foreground tabular-nums">
                    {part.price.toFixed(2)} €
                  </span>
                </div>
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
