
import React from 'react';
import { PartsHeader, PartsContent } from './container';
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
  // If a part is selected, show the part details
  if (selectedPart) {
    return (
      <PartDetailsExtended
        part={selectedPart}
        onClose={() => setSelectedPart(null)}
        onEdit={() => {
          setIsPartDetailsDialogOpen(true);
        }}
        onOrder={() => {
          openOrderDialog(selectedPart);
        }}
        onDelete={() => {
          handleDeletePart(selectedPart.id);
          setSelectedPart(null);
        }}
      />
    );
  }

  // If no part is selected, show the parts list/grid
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

      <PartsContent
        parts={parts}
        filteredParts={filteredParts}
        isLoading={isLoading}
        isError={isError}
        currentView={currentView}
        filterCount={filterCount}
        clearFilters={clearFilters}
        openPartDetails={openPartDetails}
        openOrderDialog={openOrderDialog}
      />
    </div>
  );
};

export default PartsContainer;
