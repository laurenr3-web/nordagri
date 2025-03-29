
import React, { useEffect } from 'react';
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
  // Log pour suivre l'état de selectedPart
  useEffect(() => {
    console.log("[PartsContainer] selectedPart mis à jour:", selectedPart?.name);
  }, [selectedPart]);
  
  console.log("[PartsContainer] Rendu avec selectedPart:", selectedPart?.name);
  
  // Si une pièce est sélectionnée, afficher les détails
  if (selectedPart) {
    console.log("[PartsContainer] Affichage du composant PartDetailsExtended pour:", selectedPart.name);
    return (
      <PartDetailsExtended
        part={selectedPart}
        onClose={() => {
          console.log("[PartsContainer] Fermeture des détails");
          setSelectedPart(null);
        }}
        onEdit={() => {
          console.log("[PartsContainer] Ouverture du dialogue de modification");
          setIsPartDetailsDialogOpen(true);
        }}
        onOrder={() => {
          console.log("[PartsContainer] Ouverture du dialogue de commande");
          openOrderDialog(selectedPart);
        }}
        onDelete={() => {
          console.log("[PartsContainer] Suppression de la pièce");
          handleDeletePart(selectedPart.id);
          setSelectedPart(null);
        }}
      />
    );
  }

  // Si aucune pièce n'est sélectionnée, afficher la liste ou la grille
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
            console.log("[PartsContainer] Ouverture des détails de la pièce:", part.name);
            openPartDetails(part);
          }}
          openOrderDialog={(part) => {
            console.log("[PartsContainer] Ouverture de la commande pour la pièce:", part.name);
            openOrderDialog(part);
          }}
        />
      )}
    </div>
  );
};

export default PartsContainer;
