
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PartsDesktopView } from './displays/PartsDesktopView';
import { PartsMobileView } from './displays/PartsMobileView';
import { PartsToolbar } from './toolbar/PartsToolbar';
import { PartsFilters } from './filters/PartsFilters';
import { PartsEmptyState } from './states/PartsEmptyState';
import { PartsErrorState } from './states/PartsErrorState';
import { PartsLoadingState } from './states/PartsLoadingState';
import PartDetailsDialog from './dialogs/PartDetailsDialog';
import AddPartDialog from './dialogs/AddPartDialog';
import ExpressAddPartDialog from './dialogs/ExpressAddPartDialog';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Part } from '@/types/Part';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import WithdrawalDialog from './dialogs/WithdrawalDialog';

interface PartsContainerProps {
  parts: Part[];
  filteredParts: Part[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch?: () => void;
  
  // Filters
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
  
  // Sorting
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  
  // View
  currentView: string;
  setCurrentView: (view: string) => void;
  
  // Select
  selectedParts?: (string | number)[];
  onSelectPart?: (partId: string | number, checked: boolean) => void;
  onDeleteSelected?: () => void;
  
  // Detail and order
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
}

const PartsContainer: React.FC<PartsContainerProps> = ({
  parts,
  filteredParts,
  isLoading,
  isError,
  error,
  refetch,
  
  // Filters and sorting
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
  
  // View
  currentView,
  setCurrentView,
  
  // Select
  selectedParts = [],
  onSelectPart = () => {},
  onDeleteSelected,
  
  // Detail and order
  openPartDetails,
  openOrderDialog,
}) => {
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isAddPartDialogOpen, setIsAddPartDialogOpen] = useState(false);
  const [isExpressAddDialogOpen, setIsExpressAddDialogOpen] = useState(false);
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [selectedDetailPart, setSelectedDetailPart] = useState<Part | null>(null);
  
  const { 
    openWithdrawalDialog, 
    isWithdrawalDialogOpen, 
    selectedPart, 
    setIsWithdrawalDialogOpen 
  } = usePartsWithdrawal();
  
  // Get stock status color based on levels
  const getStockStatusColor = (part: Part) => {
    if (part.stock === 0) return "text-destructive";
    if (part.stock <= part.reorderPoint) return "text-yellow-600";
    return "";
  };

  // Handle opening details dialog
  const handleOpenDetails = (part: Part) => {
    setSelectedDetailPart(part);
    setIsPartDetailsDialogOpen(true);
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
        {/* Vue mobile */}
        <PartsMobileView 
          parts={filteredParts} 
          selectedParts={selectedParts}
          onSelectPart={onSelectPart}
          openPartDetails={handleOpenDetails}
          openOrderDialog={openOrderDialog}
          openWithdrawalDialog={openWithdrawalDialog}
          getStockStatusColor={getStockStatusColor}
        />
        
        {/* Vue desktop */}
        <PartsDesktopView 
          parts={filteredParts}
          selectedParts={selectedParts}
          onSelectPart={onSelectPart}
          openPartDetails={handleOpenDetails}
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
        view={currentView as PartsView}
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
        onAddPart={() => setIsAddPartDialogOpen(true)}
        onWithdrawPart={() => setIsWithdrawalDialogOpen(true)}
      />
      
      <div className="grid md:grid-cols-[240px,1fr] gap-4">
        {/* Filtres sur desktop */}
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
        
        {/* Contenu principal */}
        <Card>
          <CardContent className="p-0 sm:p-3 md:p-6">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
      
      {/* Sheet pour les filtres sur mobile */}
      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
        <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
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
      
      {/* Dialogue de retrait */}
      <WithdrawalDialog 
        isOpen={isWithdrawalDialogOpen} 
        onOpenChange={setIsWithdrawalDialogOpen}
        part={selectedPart}
      />

      {/* Dialogue d'ajout de pièce */}
      <AddPartDialog
        isOpen={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
      />

      {/* Dialogue d'ajout express */}
      <ExpressAddPartDialog
        isOpen={isExpressAddDialogOpen}
        onOpenChange={setIsExpressAddDialogOpen}
      />

      {/* Dialogue de détails de pièce */}
      <PartDetailsDialog
        isOpen={isPartDetailsDialogOpen}
        onOpenChange={setIsPartDetailsDialogOpen}
        selectedPart={selectedDetailPart}
      />
    </div>
  );
};

export default PartsContainer;
