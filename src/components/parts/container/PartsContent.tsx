
import React from 'react';
import PartsGrid from '@/components/parts/PartsGrid';
import PartsList from '@/components/parts/PartsList';
import { Part } from '@/types/Part';
import { PartsView } from '@/hooks/parts/usePartsFilter';
import { LoadingState, ErrorState, EmptyState } from './PartsStatusStates';

interface PartsContentProps {
  parts: Part[];
  filteredParts: Part[];
  isLoading?: boolean;
  isError?: boolean;
  currentView: PartsView;
  filterCount?: number;
  clearFilters?: () => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
}

const PartsContent: React.FC<PartsContentProps> = ({
  parts,
  filteredParts,
  isLoading = false,
  isError = false,
  currentView,
  filterCount = 0,
  clearFilters,
  openPartDetails,
  openOrderDialog
}) => {
  // Afficher l'état de chargement
  if (isLoading) {
    return <LoadingState message="Chargement des pièces..." />;
  }
  
  // Afficher l'état d'erreur
  if (isError) {
    return (
      <ErrorState 
        message="Une erreur est survenue lors du chargement des pièces." 
        onRetry={() => window.location.reload()} 
      />
    );
  }
  
  // Afficher l'état vide
  if (filteredParts.length === 0) {
    return (
      <EmptyState 
        message="Aucune pièce trouvée avec les critères actuels." 
        filterActive={filterCount > 0}
        onClearFilters={clearFilters}
      />
    );
  }
  
  // Afficher soit la grille, soit la liste selon la vue sélectionnée
  return currentView === 'grid' ? (
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
  );
};

export default PartsContent;
