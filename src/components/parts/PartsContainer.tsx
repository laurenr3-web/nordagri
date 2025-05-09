
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PartsDesktopView } from './displays/PartsDesktopView';
import { PartsMobileView } from './displays/PartsMobileView';
import { PartsToolbar } from './toolbar/PartsToolbar';
import { PartsFilters } from './filters/PartsFilters';
import { PartsEmptyState } from './states/PartsEmptyState';
import { PartsErrorState } from './states/PartsErrorState';
import { PartsLoadingState } from './states/PartsLoadingState';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import WithdrawalDialog from './dialogs/WithdrawalDialog';
import { Part } from '@/types/Part';
import { PartsView } from '@/hooks/parts/usePartsFilter';

interface PartsContainerProps {
  // Données des pièces
  parts: Part[];
  filteredParts: Part[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch?: () => void;
  
  // Filtres et tri
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
  manufacturers: string[];
  filterManufacturers: string[];
  toggleManufacturerFilter: (manufacturer: string) => void;
  filterMinPrice: number;
  setFilterMinPrice: (price: number) => void;
  filterMaxPrice: number;
  setFilterMaxPrice: (price: number) => void;
  filterInStock: boolean;
  setFilterInStock: (inStock: boolean) => void;
  filterCount: number;
  clearFilters: () => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  
  // Vue
  currentView: PartsView;
  setCurrentView: (view: string) => void;
  
  // Sélection
  selectedParts?: string[] | number[];
  onSelectPart?: (partId: string | number) => void;
  onDeleteSelected?: () => void;
  
  // Détail et commande
  openPartDetails?: (part: Part) => void;
  openOrderDialog?: (part: Part) => void;
  
  // Actions
  onAddPart?: () => void;
  onWithdrawPart?: () => void;
}

const PartsContainer: React.FC<PartsContainerProps> = ({
  // Données des pièces
  parts,
  filteredParts,
  isLoading,
  isError,
  error,
  refetch,
  
  // Filtres et tri
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  categories,
  manufacturers,
  filterManufacturers,
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
  
  // Vue
  currentView,
  setCurrentView,
  
  // Sélection
  selectedParts = [],
  onSelectPart = () => {},
  onDeleteSelected,
  
  // Détail et commande
  openPartDetails,
  openOrderDialog,
  
  // Actions
  onAddPart,
  onWithdrawPart
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const { openWithdrawalDialog, isWithdrawalDialogOpen, selectedPart, setIsWithdrawalDialogOpen } = usePartsWithdrawal();

  // Get stock status color based on levels
  const getStockStatusColor = (part: Part) => {
    if (part.stock === 0) return "text-destructive";
    if (part.stock <= part.reorderPoint) return "text-yellow-600";
    return "";
  };

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <PartsLoadingState />;
    }
    
    if (isError) {
      return (
        <PartsErrorState 
          error={error instanceof Error ? error.message : "Une erreur s'est produite lors du chargement des pièces."} 
          refetch={refetch}
        />
      );
    }
    
    if (!isLoading && filteredParts.length === 0) {
      return <PartsEmptyState onClearFilters={filterCount > 0 ? clearFilters : undefined} />;
    }
    
    return (
      <>
        <PartsMobileView 
          parts={filteredParts}
          selectedParts={selectedParts}
          onSelectPart={onSelectPart}
          openPartDetails={openPartDetails}
          openOrderDialog={openOrderDialog}
          openWithdrawalDialog={openWithdrawalDialog}
          getStockStatusColor={getStockStatusColor}
        />
        
        <PartsDesktopView 
          parts={filteredParts}
          selectedParts={selectedParts}
          onSelectPart={onSelectPart}
          openPartDetails={openPartDetails}
          openOrderDialog={openOrderDialog}
          openWithdrawalDialog={openWithdrawalDialog}
          getStockStatusColor={getStockStatusColor}
        />
      </>
    );
  };

  return (
    <div className="space-y-4">
      <PartsToolbar 
        view={currentView}
        setView={(view) => setCurrentView(view)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCount={filterCount}
        onFilterClick={() => setIsFilterSheetOpen(true)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedCount={selectedParts.length}
        onDeleteSelected={onDeleteSelected}
        totalParts={parts.length}
        filteredParts={filteredParts.length}
        onAddPart={onAddPart}
        onWithdrawPart={onWithdrawPart}
      />
      
      <div className="grid md:grid-cols-[240px,1fr] gap-4">
        <div className="hidden md:block">
          <PartsFilters 
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            manufacturers={manufacturers}
            selectedManufacturers={filterManufacturers}
            toggleManufacturer={toggleManufacturerFilter}
            minPrice={filterMinPrice}
            setMinPrice={setFilterMinPrice}
            maxPrice={filterMaxPrice}
            setMaxPrice={setFilterMaxPrice}
            inStock={filterInStock}
            setInStock={setFilterInStock}
            filterCount={filterCount}
            clearFilters={clearFilters}
          />
        </div>
        
        <Card>
          <CardContent className="p-0 sm:p-3 md:p-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
      
      <Sheet 
        open={isFilterSheetOpen} 
        onOpenChange={setIsFilterSheetOpen}
      >
        <SheetContent 
          side="left" 
          className="w-[300px] sm:w-[400px] p-0"
        >
          <div className="h-full overflow-y-auto py-6 px-4">
            <PartsFilters 
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={(cat) => {
                setSelectedCategory(cat);
                setIsFilterSheetOpen(false);
              }}
              manufacturers={manufacturers}
              selectedManufacturers={filterManufacturers}
              toggleManufacturer={toggleManufacturerFilter}
              minPrice={filterMinPrice}
              setMinPrice={setFilterMinPrice}
              maxPrice={filterMaxPrice}
              setMaxPrice={setFilterMaxPrice}
              inStock={filterInStock}
              setInStock={setFilterInStock}
              filterCount={filterCount}
              clearFilters={() => {
                clearFilters();
                setIsFilterSheetOpen(false);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      <WithdrawalDialog 
        isOpen={isWithdrawalDialogOpen}
        onOpenChange={setIsWithdrawalDialogOpen}
        part={selectedPart}
      />
    </div>
  );
};

export default PartsContainer;
