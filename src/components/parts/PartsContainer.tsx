
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PartsDesktopView } from './displays/PartsDesktopView';
import { PartsMobileView } from './displays/PartsMobileView';
import { PartsCompactFilters } from './toolbar/PartsCompactFilters';
import { PartsEmptyState } from './states/PartsEmptyState';
import { PartsErrorState } from './states/PartsErrorState';
import { PartsLoadingState } from './states/PartsLoadingState';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { WithdrawalDialog } from './dialogs/withdrawal';
import { Part } from '@/types/Part';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import PartDetailsDialog from './dialogs/PartDetailsDialog';
import { EmptyState } from '@/components/help/EmptyState';
import { emptyStates } from '@/content/help/emptyStates';

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
  onWithdrawPart: _onWithdrawPart
}) => {
  const { openWithdrawalDialog, isWithdrawalDialogOpen, selectedPart, setIsWithdrawalDialogOpen } = usePartsWithdrawal();
  const [isPartDetailsDialogOpen, setIsPartDetailsDialogOpen] = useState(false);
  const [selectedPartForDetails, setSelectedPartForDetails] = useState<Part | null>(null);

  // Get stock status color based on levels
  const getStockStatusColor = (part: Part) => {
    if (part.stock === 0) return "text-destructive";
    if (part.stock <= part.reorderPoint) return "text-yellow-600";
    return "";
  };

  // Fonction pour gérer l'ouverture des détails de pièce
  const handleOpenPartDetails = (part: Part) => {
    setSelectedPartForDetails(part);
    setIsPartDetailsDialogOpen(true);
    console.log("Opening details for part:", part);
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
      // No filters active and no parts at all → pedagogical empty state
      if (filterCount === 0 && parts.length === 0) {
        return (
          <EmptyState
            icon={emptyStates.partsList.icon}
            title={emptyStates.partsList.title}
            description={emptyStates.partsList.description}
            action={
              onAddPart
                ? {
                    label: emptyStates.partsList.actionLabel,
                    onClick: onAddPart,
                  }
                : undefined
            }
            secondaryAction={
              emptyStates.partsList.articleId
                ? {
                    label: emptyStates.partsList.secondaryActionLabel!,
                    articleId: emptyStates.partsList.articleId,
                  }
                : undefined
            }
          />
        );
      }
      return <PartsEmptyState onClearFilters={filterCount > 0 ? clearFilters : undefined} />;
    }
    
    return (
      <>
        <PartsMobileView 
          parts={filteredParts}
          selectedParts={selectedParts}
          onSelectPart={onSelectPart}
          openPartDetails={handleOpenPartDetails}
          openOrderDialog={openOrderDialog}
          openWithdrawalDialog={openWithdrawalDialog}
          getStockStatusColor={getStockStatusColor}
        />
        
        <PartsDesktopView 
          parts={filteredParts}
          selectedParts={selectedParts}
          onSelectPart={onSelectPart}
          openPartDetails={handleOpenPartDetails}
          openOrderDialog={openOrderDialog}
          openWithdrawalDialog={openWithdrawalDialog}
          getStockStatusColor={getStockStatusColor}
        />
      </>
    );
  };

  return (
    <div className="space-y-3 w-full max-w-full overflow-x-hidden">
      <PartsCompactFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        manufacturers={manufacturers}
        filterManufacturers={filterManufacturers}
        toggleManufacturerFilter={toggleManufacturerFilter}
        filterInStock={filterInStock}
        setFilterInStock={setFilterInStock}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={currentView}
        setView={(v) => setCurrentView(v)}
        filterCount={filterCount}
        clearFilters={clearFilters}
        filteredCount={filteredParts.length}
      />

      <Card>
        <CardContent className="p-0 sm:p-2 md:p-4">
          {renderContent()}
        </CardContent>
      </Card>

      <WithdrawalDialog 
        isOpen={isWithdrawalDialogOpen}
        onOpenChange={setIsWithdrawalDialogOpen}
        part={selectedPart}
      />

      <PartDetailsDialog 
        isOpen={isPartDetailsDialogOpen}
        onOpenChange={setIsPartDetailsDialogOpen}
        selectedPart={selectedPartForDetails}
      />
    </div>
  );
};

export default PartsContainer;
