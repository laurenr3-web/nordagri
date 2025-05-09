
import React from 'react';
import { Part } from '@/types/Part';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PartsDesktopViewProps {
  parts: Part[];
  selectedParts: (string | number)[];
  onSelectPart: (partId: string | number, selected: boolean) => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog?: (part: Part) => void;
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
    <div className="hidden sm:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Référence</TableHead>
            <TableHead>Emplacement</TableHead>
            <TableHead className="text-center">Stock</TableHead>
            <TableHead className="text-center">Prix</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parts.map(part => {
            const isAnimatingOut = animatingOut.includes(part.id);
            
            return (
              <TableRow 
                key={part.id}
                className={`${isAnimatingOut ? 'opacity-50' : ''}`}
              >
                <TableCell className="font-medium cursor-pointer hover:underline" onClick={() => openPartDetails(part)}>
                  {part.name}
                </TableCell>
                <TableCell>{part.partNumber}</TableCell>
                <TableCell>{part.location}</TableCell>
                <TableCell className={`text-center ${getStockStatusColor(part)}`}>
                  {part.stock}
                </TableCell>
                <TableCell className="text-center">
                  {part.price?.toFixed(2)} €
                </TableCell>
                <TableCell className="text-right space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPartDetails(part)}
                  >
                    Détails
                  </Button>
                  {openWithdrawalDialog && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openWithdrawalDialog(part)}
                    >
                      Retirer
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {parts.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Aucune pièce trouvée
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
