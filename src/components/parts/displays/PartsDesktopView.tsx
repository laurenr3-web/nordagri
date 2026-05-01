
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PartsDesktopViewProps {
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
      {stock}
    </Badge>
  );
};

export const PartsDesktopView: React.FC<PartsDesktopViewProps> = ({
  parts,
  selectedParts,
  onSelectPart,
  openPartDetails,
  openOrderDialog,
  openWithdrawalDialog,
  openAddStockDialog,
  getStockStatusColor: _getStockStatusColor,
  animatingOut = []
}) => {
  return (
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow className="h-10">
            <TableHead className="py-2 text-xs">Nom</TableHead>
            <TableHead className="py-2 text-xs">Référence</TableHead>
            <TableHead className="py-2 text-xs">Emplacement</TableHead>
            <TableHead className="py-2 text-xs">Catégorie</TableHead>
            <TableHead className="py-2 text-xs">Stock</TableHead>
            <TableHead className="py-2 text-xs text-right">Prix</TableHead>
            <TableHead className="py-2 text-xs text-right w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map(part => {
            const isAnimatingOut = animatingOut.includes(part.id);
            
            return (
              <TableRow 
                key={part.id}
                className={`h-12 ${isAnimatingOut ? 'opacity-50' : ''}`}
              >
                <TableCell
                  className="py-2 text-sm font-medium cursor-pointer hover:underline"
                  onClick={() => openPartDetails(part)}
                >
                  {part.name}
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {part.partNumber}
                </TableCell>
                <TableCell className="py-2 text-sm text-muted-foreground">
                  {part.location}
                </TableCell>
                <TableCell className="py-2">
                  {part.category ? (
                    <Badge variant="outline" className="text-xs font-normal">
                      {part.category}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-2">
                  {renderStockBadge(part.stock)}
                </TableCell>
                <TableCell className="py-2 text-sm text-right tabular-nums">
                  {part.price?.toFixed(2)} €
                </TableCell>
                <TableCell className="py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {openAddStockDialog && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                        title="Ajouter au stock"
                        onClick={() => openAddStockDialog(part)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Ajouter au stock</span>
                      </Button>
                    )}
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openPartDetails(part)}>
                        Voir / Modifier
                      </DropdownMenuItem>
                      {openAddStockDialog && (
                        <DropdownMenuItem onClick={() => openAddStockDialog(part)}>
                          Ajouter au stock
                        </DropdownMenuItem>
                      )}
                      {openWithdrawalDialog && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => openWithdrawalDialog(part)}
                          >
                            Retirer du stock
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {parts.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Aucune pièce trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
