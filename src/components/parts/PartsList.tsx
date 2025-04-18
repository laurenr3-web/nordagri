
import React, { useState, useRef, useEffect } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Part } from '@/types/Part';

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
      
      <div className="overflow-x-auto">
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
            {parts.map((part) => (
              <tr key={part.id} className="hover:bg-secondary/30">
                <td className="p-3">
                  <Checkbox
                    checked={selectedParts.includes(part.id)}
                    onCheckedChange={(checked) => 
                      handleSelectPart(part.id, !!checked)
                    }
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
                        // Set a default image if the part image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://placehold.co/100x100/png?text=No+Image';
                      }}
                    />
                  </div>
                </td>
                <td className="p-3 font-medium">{part.name}</td>
                <td className="p-3">{part.partNumber}</td>
                <td className="p-3">{part.manufacturer}</td>
                <td className="p-3">${part.price.toFixed(2)}</td>
                <td className="p-3">
                  <span className={part.stock <= part.reorderPoint ? 'text-destructive font-medium' : ''}>
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
                      aria-label="Voir les détails de la pièce"
                    >
                      Details
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="h-8 px-2" 
                      onClick={() => openOrderDialog(part)}
                      aria-label="Commander cette pièce"
                    >
                      Order
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BlurContainer>
  );
};

export default PartsList;
