
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
  filterCount: number;
  clearFilters: () => void;
  openPartDetails: (part: Part) => void;
  openOrderDialog: (part: Part) => void;
}

const PartsContent: React.FC<PartsContentProps> = ({
  parts,
  filteredParts,
  isLoading = false,
  isError = false,
  currentView,
  filterCount,
  clearFilters,
  openPartDetails,
  openOrderDialog
}) => {
  // Render loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Render error state
  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />;
  }

  // Render empty state
  if (filteredParts.length === 0) {
    return <EmptyState filterActive={filterCount > 0} onClearFilters={clearFilters} />;
  }

  // Render content based on selected view
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
