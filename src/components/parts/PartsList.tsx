
import React, { useState, useRef, useEffect } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Trash2, Box } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Part } from '@/types/Part';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface PartsListProps {
  parts: Part[];
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
  onDeleteSelected?: (partIds: (string | number)[]) => Promise<void>;
  isDeleting?: boolean;
}

const PartsList: React.FC<PartsListProps> = ({ 
  parts, 
  openPartDetails, 
  openOrderDialog,
  onDeleteSelected,
  isDeleting = false
}) => {
  const [selectedParts, setSelectedParts] = useState<(string | number)[]>([]);
  const allCheckboxRef = useRef<HTMLButtonElement>(null);

  // Handle indeterminate checkbox state
  useEffect(() => {
    if (allCheckboxRef.current) {
      const isIndeterminate = selectedParts.length > 0 && selectedParts.length < parts.length;
      // Set the indeterminate property directly on the DOM element
      allCheckboxRef.current.dataset.indeterminate = isIndeterminate ? 'true' : 'false';
      allCheckboxRef.current.setAttribute('aria-checked', isIndeterminate ? 'mixed' : (selectedParts.length === parts.length ? 'true' : 'false'));
    }
  }, [selectedParts, parts]);

  const handleSelectAll = (checked: boolean) => {
    setSelectedParts(checked ? parts.map(part => part.id) : []);
  };

  const handleSelectPart = (partId: string | number, checked: boolean) => {
    setSelectedParts(prev => 
      checked 
        ? [...prev, partId]
        : prev.filter(id => id !== partId)
    );
  };

  const handleDeleteSelected = async () => {
    if (onDeleteSelected && selectedParts.length > 0) {
      await onDeleteSelected(selectedParts);
      setSelectedParts([]); // Reset selection after deletion
    }
  };

  const getStockStatusColor = (part: Part) => {
    if (part.stock <= 0) return 'text-destructive';
    if (part.stock <= part.reorderPoint) return 'text-yellow-500';
    return 'text-green-500';
  };

  const allSelected = parts.length > 0 && selectedParts.length === parts.length;
  const someSelected = selectedParts.length > 0 && selectedParts.length < parts.length;

  return (
    <BlurContainer className="overflow-hidden rounded-lg animate-fade-in">
      {selectedParts.length > 0 && (
        <div className="bg-destructive/5 p-2 flex items-center justify-between border-b">
          <span className="text-sm">
            {selectedParts.length} pièce{selectedParts.length > 1 ? 's' : ''} sélectionnée{selectedParts.length > 1 ? 's' : ''}
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            <span>Supprimer la sélection</span>
          </Button>
        </div>
      )}
      
      {/* Table header - Hidden on mobile */}
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="bg-secondary/50">
              <th className="text-left p-3">
                <Checkbox
                  ref={allCheckboxRef}
                  checked={allSelected}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                  aria-label="Sélectionner toutes les pièces"
                  data-state={allSelected ? "checked" : (someSelected ? "indeterminate" : "unchecked")}
                />
              </th>
              <th className="text-left p-3 font-medium">Image</th>
              <th className="text-left p-3 font-medium">Nom</th>
              <th className="text-left p-3 font-medium">Référence</th>
              <th className="text-left p-3 font-medium">Fabricant</th>
              <th className="text-left p-3 font-medium">Prix</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Emplacement</th>
              <th className="text-left p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {/* Desktop view */}
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-secondary/30 hidden md:table-row">
                <td className="p-3">
                  <Checkbox
                    checked={selectedParts.includes(part.id)}
                    onCheckedChange={(checked) => handleSelectPart(part.id, !!checked)}
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
                <td className="p-3">{part.location}</td>
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

      {/* Mobile view */}
      <div className="md:hidden divide-y">
        {parts.map((part) => (
          <div key={part.id} className="p-3 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedParts.includes(part.id)}
                onCheckedChange={(checked) => handleSelectPart(part.id, !!checked)}
                aria-label={`Sélectionner ${part.name}`}
              />
              <div 
                className="h-14 w-14 rounded-md overflow-hidden flex-shrink-0" 
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
                <h3 className="font-medium text-sm line-clamp-1">{part.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    <span className="text-xs truncate">{part.partNumber}</span>
                  </Badge>
                  <span className="text-xs text-muted-foreground truncate">{part.manufacturer}</span>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={cn("text-sm font-medium flex items-center gap-1", getStockStatusColor(part))}>
                    {part.stock} {part.stock <= part.reorderPoint && <AlertCircle size={14} />}
                  </span>
                  <span className="text-sm font-medium">{part.price.toFixed(2)}€</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 px-2 flex-1" 
                onClick={() => openPartDetails(part)}
              >
                Détails
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="h-8 px-2 flex-1" 
                onClick={() => openOrderDialog(part)}
              >
                Commander
              </Button>
            </div>
          </div>
        ))}
      </div>
    </BlurContainer>
  );
};

export default PartsList;
