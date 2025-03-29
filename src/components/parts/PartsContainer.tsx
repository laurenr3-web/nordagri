import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PlusCircle, FilterIcon, SortAsc } from 'lucide-react';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
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
  categories,
  currentView,
  setCurrentView,
  selectedPart,
  setSelectedPart,
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  filterManufacturers,
  manufacturers,
  toggleManufacturerFilter,
  filterMinPrice,
  setFilterMinPrice,
  filterMaxPrice,
  setFilterMaxPrice,
  filterInStock,
  setFilterInStock,
  filterCount,
  clearFilters,
  sortBy,
  setSortBy,
  isPartDetailsDialogOpen,
  setIsPartDetailsDialogOpen,
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  isAddCategoryDialogOpen,
  setIsAddCategoryDialogOpen,
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  isSortDialogOpen,
  setIsSortDialogOpen,
  isOrderDialogOpen,
  setIsOrderDialogOpen,
  orderQuantity,
  setOrderQuantity,
  orderNote,
  setOrderNote,
  isOrderSuccess,
  handleAddPart,
  handleUpdatePart,
  handleDeletePart,
  handleOrderSubmit,
  openPartDetails,
  openOrderDialog
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchTerm);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    setSearchTerm(value);
  };

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Rechercher une pièce..."
              className="w-full rounded-md border border-input px-4 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={localSearchValue}
              onChange={handleSearch}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setIsFilterDialogOpen(true)}>
            <FilterIcon className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSortDialogOpen(true)}>
            <SortAsc className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Select
            value={currentView}
            onValueChange={(value) => setCurrentView(value as PartsView)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Affichage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grille</SelectItem>
              <SelectItem value="list">Liste</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setIsAddPartDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </div>
      </div>

      {currentView === 'grid' ? (
        <PartsGrid 
          parts={filteredParts} 
          openPartDetails={openPartDetails} 
          openOrderDialog={openOrderDialog}
        />
      ) : (
        <PartsList 
          parts={filteredParts} 
          openPartDetails={openPartDetails} 
          openOrderDialog={openOrderDialog}
        />
      )}
    </div>
  );
};

export default PartsContainer;
