
import React, { useState } from 'react';
import { Part } from '@/types/Part';  // Use the updated Part type
import PartsHeader from './PartsHeader';
import PartsGrid from './PartsGrid';
import PartsList from './PartsList';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import FilterSortDialogs from './dialogs/FilterSortDialogs';
import PartDetailsDialog from './dialogs/PartDetailsDialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteMultipleParts } from '@/services/supabase/parts';

// Update interface to match the Part type with number[] compatibility
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
  selectedCategory,
  setSelectedCategory,
  handleAddPart,
  handleUpdatePart,
  handleDeletePart,
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
  isAddPartDialogOpen,
  setIsAddPartDialogOpen,
  refetch
}) => {
  const {
    toast
  } = useToast();
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false);

  const handleDeleteMultiple = async (partIds: (string | number)[]) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${partIds.length} pièce(s) ?`)) {
      return;
    }

    try {
      setIsDeletingMultiple(true);

      // Delete all selected parts using the bulk delete function which now handles both string and number IDs
      await deleteMultipleParts(partIds);

      toast({
        title: "Suppression réussie",
        description: `${partIds.length} pièce(s) ont été supprimées avec succès`
      });

      // Refresh the data without full page reload
      if (refetch) {
        refetch();
      }
    } catch (error) {
      console.error('Error deleting multiple parts:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression des pièces",
        variant: "destructive"
      });
    } finally {
      setIsDeletingMultiple(false);
    }
  };

  if (isLoading) {
    return <div className="flex flex-col items-center justify-center min-h-[400px] bg-background/80">
        <Loader2 className="h-8 w-8 animate-spin opacity-70" />
        <p className="mt-2 text-sm text-muted-foreground">Chargement des pièces...</p>
      </div>;
  }

  if (isError) {
    return <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de charger les pièces. Veuillez réessayer plus tard.
          {refetch && <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
              Réessayer
            </Button>}
        </AlertDescription>
      </Alert>;
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6">
        <PartsHeader 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          currentView={currentView} 
          setCurrentView={setCurrentView}
          onOpenFilterDialog={() => setIsFilterDialogOpen(true)}
          onOpenSortDialog={() => setIsSortDialogOpen(true)}
          filterCount={filterCount}
        />

        {filteredParts.length > 0 ? (
          currentView === 'grid' ? (
            <div className="mt-6">
              <PartsGrid 
                parts={filteredParts} 
                openPartDetails={openPartDetails}
                openOrderDialog={() => {}}
              />
            </div>
          ) : (
            <PartsList
              parts={filteredParts}
              openPartDetails={openPartDetails}
              openOrderDialog={() => {}}
              onDeleteSelected={handleDeleteMultiple}
              isDeleting={isDeletingMultiple}
            />
          )
        ) : parts.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="mb-4 text-center text-muted-foreground">
              Aucune pièce ne correspond à vos critères de recherche ou filtres.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <p className="mb-4 text-center text-muted-foreground">
              Aucune pièce enregistrée. Ajoutez votre première pièce.
            </p>
            <Button variant="default" onClick={() => setIsAddPartDialogOpen(true)}>
              Ajouter une pièce
            </Button>
          </div>
        )}
      </Card>

      <FilterSortDialogs
        isFilterDialogOpen={isFilterDialogOpen}
        setIsFilterDialogOpen={setIsFilterDialogOpen}
        isSortDialogOpen={isSortDialogOpen}
        setIsSortDialogOpen={setIsSortDialogOpen}
      />

      <PartDetailsDialog
        isOpen={isPartDetailsDialogOpen}
        onOpenChange={setIsPartDetailsDialogOpen}
        selectedPart={selectedPart}
        onEdit={handleUpdatePart}
        onDelete={handleDeletePart}
      />
    </div>
  );
};

export default PartsContainer;
