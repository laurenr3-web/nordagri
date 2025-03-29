
import React, { useEffect, useState } from 'react';
import { PartsHeader, PartsContent, LoadingState, ErrorState, EmptyState } from './container';
import PartDetailsExtended from './PartDetailsExtended';
import { Part } from '@/types/Part';
import { PartsView } from '@/hooks/parts/usePartsFilter';

interface PartsContainerProps {
  parts: Part[];
  filteredParts: Part[];
  isLoading?: boolean; 
  isError?: boolean;
  categories: string[];
  currentView: PartsView;
  setCurrentView: (view: PartsView) => void;
  selectedPart: Part | null;
  setSelectedPart: (part: Part | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  filterManufacturers: string[];
  manufacturers: string[];
  toggleManufacturerFilter: (manufacturer: string) => void;
  filterMinPrice: string;
  setFilterMinPrice: (price: string) => void;
  filterMaxPrice: string;
  setFilterMaxPrice: (price: string) => void;
  filterInStock: boolean;
  setFilterInStock: (inStock: boolean) => void;
  filterCount: number;
  clearFilters: () => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  isPartDetailsDialogOpen: boolean;
  setIsPartDetailsDialogOpen: (open: boolean) => void;
  isAddPartDialogOpen: boolean;
  setIsAddPartDialogOpen: (open: boolean) => void;
  isAddCategoryDialogOpen: boolean;
  setIsAddCategoryDialogOpen: (open: boolean) => void;
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;
  isSortDialogOpen: boolean;
  setIsSortDialogOpen: (open: boolean) => void;
  isOrderDialogOpen: boolean;
  setIsOrderDialogOpen: (open: boolean) => void;
  orderQuantity: string;
  setOrderQuantity: (quantity: string) => void;
  orderNote?: string;
  setOrderNote?: (note: string) => void;
  isOrderSuccess?: boolean;
  handleAddPart: (part: Part) => void;
  handleUpdatePart: (part: Part) => void;
  handleDeletePart: (partId: string | number) => void;
  handleOrderSubmit: () => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
}

const PartsContainer: React.FC<PartsContainerProps> = ({
  parts,
  filteredParts,
  isLoading = false,
  isError = false,
  currentView,
  setCurrentView,
  selectedPart,
  setSelectedPart,
  searchTerm,
  setSearchTerm,
  filterCount,
  clearFilters,
  isPartDetailsDialogOpen,
  setIsPartDetailsDialogOpen,
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  isSortDialogOpen,
  setIsSortDialogOpen,
  handleDeletePart,
  openPartDetails,
  openOrderDialog
}) => {
  // Track when component is transitioning selectedPart
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Log for debugging
  useEffect(() => {
    console.log("[PartsContainer] selectedPart state:", selectedPart?.name, "isTransitioning:", isTransitioning);
  }, [selectedPart, isTransitioning]);
  
  // Safe way to close part details
  const handleClosePartDetails = () => {
    console.log("[PartsContainer] Starting transition to close part details");
    setIsTransitioning(true);
    
    // Use timeout to ensure animation completes before state change
    setTimeout(() => {
      console.log("[PartsContainer] Completing transition to close part details");
      setSelectedPart(null);
      setIsTransitioning(false);
    }, 100);
  };
  
  // If a part is selected, show the details view
  if (selectedPart && !isTransitioning) {
    console.log("[PartsContainer] Rendering PartDetailsExtended for:", selectedPart.name);
    return (
      <PartDetailsExtended
        part={selectedPart}
        onClose={handleClosePartDetails}
        onEdit={() => {
          console.log("[PartsContainer] Opening part details dialog");
          setIsPartDetailsDialogOpen(true);
        }}
        onOrder={() => {
          console.log("[PartsContainer] Opening order dialog");
          openOrderDialog(selectedPart);
        }}
        onDelete={() => {
          console.log("[PartsContainer] Deleting part");
          handleDeletePart(selectedPart.id);
          handleClosePartDetails();
        }}
      />
    );
  }

  // If no part is selected or we're transitioning, show the list/grid view
  return (
    <div className="space-y-4">
      <PartsHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setIsFilterDialogOpen={setIsFilterDialogOpen}
        setIsSortDialogOpen={setIsSortDialogOpen}
        setIsAddPartDialogOpen={setIsAddPartDialogOpen}
      />

      {isLoading ? (
        <LoadingState message="Chargement des pièces..." />
      ) : isError ? (
        <ErrorState 
          message="Une erreur est survenue lors du chargement des pièces." 
          onRetry={() => window.location.reload()} 
        />
      ) : filteredParts.length === 0 ? (
        <EmptyState 
          message="Aucune pièce trouvée avec les critères actuels." 
          filterActive={filterCount > 0}
          onClearFilters={clearFilters}
        />
      ) : (
        <PartsContent
          parts={parts}
          filteredParts={filteredParts}
          currentView={currentView}
          openPartDetails={(part) => {
            console.log("[PartsContainer] Opening part details for:", part.name);
            openPartDetails(part);
          }}
          openOrderDialog={(part) => {
            console.log("[PartsContainer] Opening order dialog for:", part.name);
            openOrderDialog(part);
          }}
        />
      )}
    </div>
  );
};

export default PartsContainer;
