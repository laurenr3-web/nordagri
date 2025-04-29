
import React, { useState, useRef, useEffect } from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Part } from '@/types/Part';
import { PartsDesktopView } from './displays/PartsDesktopView';
import { PartsMobileView } from './displays/PartsMobileView';

interface PartsListProps {
  parts: Part[];
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
  onDeleteSelected?: (partIds: (string | number)[]) => Promise<void>;
  isDeleting?: boolean;
  animatingOut?: (string | number)[];
}

const PartsList: React.FC<PartsListProps> = ({ 
  parts, 
  openPartDetails, 
  openOrderDialog,
  onDeleteSelected,
  isDeleting = false,
  animatingOut = []
}) => {
  const [selectedParts, setSelectedParts] = useState<(string | number)[]>([]);
  const allCheckboxRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (allCheckboxRef.current) {
      const isIndeterminate = selectedParts.length > 0 && selectedParts.length < parts.length;
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
      // Add all selected parts to animating out state
      // We don't need to update the local animatingOut state here since it comes from props now
      
      try {
        await onDeleteSelected(selectedParts);
        // Reset selection after successful deletion
        setSelectedParts([]);
      } catch (error) {
        console.error('Error deleting parts:', error);
      }
    }
  };

  const getStockStatusColor = (part: Part) => {
    if (part.stock <= 0) return 'text-destructive';
    if (part.stock <= part.reorderPoint) return 'text-yellow-500';
    return 'text-green-500';
  };

  const allSelected = parts.length > 0 && selectedParts.length === parts.length;
  const someSelected = selectedParts.length > 0 && selectedParts.length < parts.length;
  
  // Filter out parts that are being animated for deletion
  const visibleParts = parts.filter(part => !animatingOut.includes(part.id));

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
              <AlertCircle className="h-4 w-4 mr-2" />
            )}
            <span>Supprimer la sélection</span>
          </Button>
        </div>
      )}

      <PartsDesktopView 
        parts={visibleParts}
        selectedParts={selectedParts}
        onSelectPart={handleSelectPart}
        openPartDetails={openPartDetails}
        openOrderDialog={openOrderDialog}
        getStockStatusColor={getStockStatusColor}
        animatingOut={animatingOut}
      />

      <PartsMobileView 
        parts={visibleParts}
        selectedParts={selectedParts}
        onSelectPart={handleSelectPart}
        openPartDetails={openPartDetails}
        openOrderDialog={openOrderDialog}
        getStockStatusColor={getStockStatusColor}
        animatingOut={animatingOut}
      />
    </BlurContainer>
  );
};

export default PartsList;
