import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Part } from '@/types/Part';
import { Search, Package, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface WithdrawalPartPickerProps {
  parts: Part[];
  onSelect: (part: Part) => void;
  onClose: () => void;
}

export const WithdrawalPartPicker: React.FC<WithdrawalPartPickerProps> = ({
  parts,
  onSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inStock = parts.filter((p) => p.stock > 0);
    if (!q) return inStock;
    return inStock.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.partNumber ?? '').toString().toLowerCase().includes(q) ||
        (p.category ?? '').toLowerCase().includes(q),
    );
  }, [parts, query]);

  return (
    <div className="space-y-3 pt-2">
      <p className="text-sm text-muted-foreground">
        Choisissez la pièce à retirer du stock.
      </p>

      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom, référence, catégorie..."
          className="pl-8"
        />
      </div>

      <div className="max-h-[50vh] overflow-y-auto rounded-md border divide-y">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {parts.length === 0
              ? "Aucune pièce dans l'inventaire."
              : 'Aucune pièce ne correspond à votre recherche.'}
          </div>
        ) : (
          filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-3 p-3 hover:bg-muted/60 transition-colors text-left"
            >
              <div className="h-9 w-9 shrink-0 rounded-md bg-muted flex items-center justify-center">
                <Package className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {p.partNumber ? `Réf. ${p.partNumber}` : 'Sans référence'}
                  {p.category ? ` · ${p.category}` : ''}
                </div>
              </div>
              <Badge
                variant={p.stock <= (p.reorderPoint ?? 0) ? 'destructive' : 'secondary'}
                className="shrink-0"
              >
                {p.stock} en stock
              </Badge>
            </button>
          ))
        )}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </div>
  );
};