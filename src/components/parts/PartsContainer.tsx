
import React from 'react';
import { Part } from '@/types/Part';
import PartsHeader from './PartsHeader';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FilterSortDialogs from './dialogs/FilterSortDialogs';
import PartsDialogs from './PartsDialogs';
import { Button } from '@/components/ui/button';

interface PartsContainerProps {
  parts: Part[];
  filteredParts: Part[];
  isLoading: boolean;
  isError: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  handleAddPart: (part: Omit<Part, 'id'>) => void;
  handleUpdatePart: (part: Part) => void;
  handleDeletePart: (partId: number | string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  openPartDetails: (part: Part) => void;
  filterCount: number;
  clearFilters: () => void;
  // Dialog state
  isFilterDialogOpen: boolean;
  setIsFilterDialogOpen: (open: boolean) => void;
  isSortDialogOpen: boolean;
  setIsSortDialogOpen: (open: boolean) => void;
  selectedPart: Part | null;
  isPartDetailsDialogOpen: boolean;
  setIsPartDetailsDialogOpen: (open: boolean) => void;
  isAddPartDialogOpen: boolean;
  setIsAddPartDialogOpen: (open: boolean) => void;
  refetch?: () => void;
}

const PartsContainer: React.FC<PartsContainerProps> = ({
  parts,
  filteredParts,
  isLoading,
  isError,
  searchTerm,
  setSearchTerm,
  currentView,
  setCurrentView,
  openPartDetails,
  filterCount,
  clearFilters,
  isFilterDialogOpen,
  setIsFilterDialogOpen,
  isSortDialogOpen,
  setIsSortDialogOpen,
  selectedPart,
  isPartDetailsDialogOpen,
  setIsPartDetailsDialogOpen,
  handleUpdatePart,
  handleDeletePart,
  refetch
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-background/80">
        <Loader2 className="h-8 w-8 animate-spin opacity-70" />
        <p className="mt-2 text-sm text-muted-foreground">Chargement des pièces...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les pièces. Veuillez réessayer plus tard.
          {refetch && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => refetch()}
            >
              Réessayer
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <PartsHeader
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenFilterDialog={() => setIsFilterDialogOpen(true)}
          onOpenSortDialog={() => setIsSortDialogOpen(true)}
          filterCount={filterCount}
        />

        {currentView === 'grid' ? (
          <PartsGrid
            parts={filteredParts}
            onPartClick={openPartDetails}
          />
        ) : (
          <PartsList
            parts={filteredParts}
            onPartClick={openPartDetails}
          />
        )}

        {filteredParts.length === 0 && parts.length > 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="mb-4 text-center text-muted-foreground">
              Aucune pièce ne correspond à vos critères de recherche ou filtres.
            </p>
            <Button
              variant="outline"
              onClick={clearFilters}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}

        {parts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="mb-4 text-center text-muted-foreground">
              Votre inventaire de pièces est vide. Ajoutez votre première pièce.
            </p>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <FilterSortDialogs
        isFilterOpen={isFilterDialogOpen}
        onFilterOpenChange={setIsFilterDialogOpen}
        isSortOpen={isSortDialogOpen}
        onSortOpenChange={setIsSortDialogOpen}
      />

      <PartsDialogs
        selectedPart={selectedPart}
        isPartDetailsDialogOpen={isPartDetailsDialogOpen}
        setIsPartDetailsDialogOpen={setIsPartDetailsDialogOpen}
        handleEditPart={handleUpdatePart}
        handleDeletePart={handleDeletePart}
      />
    </div>
  );
};

export default PartsContainer;
