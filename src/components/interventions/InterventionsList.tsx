
import React from 'react';
import { Intervention } from '@/types/Intervention';
import InterventionsCardList from './cards/InterventionsCardList';

export interface InterventionsListProps {
  filteredInterventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
  searchQuery: string;
  selectedPriority: string;
  currentView: string;
  setCurrentView: (view: string) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriorityChange: (priority: string) => void;
  // Add the missing prop
  onClearSearch: () => void;
}

const InterventionsList: React.FC<InterventionsListProps> = ({
  filteredInterventions,
  onViewDetails,
  onStartWork,
  searchQuery,
  selectedPriority,
  onSearchChange,
  onPriorityChange,
  currentView,
  setCurrentView,
  onClearSearch
}) => {
  // Determine if the device is mobile (for responsive design)
  const isMobile = window.innerWidth < 640;

  return (
    <div className="w-full">
      {filteredInterventions.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {searchQuery || selectedPriority !== 'all'
              ? "Aucune intervention ne correspond à votre recherche."
              : "Aucune intervention disponible."}
          </p>
          {(searchQuery || selectedPriority !== 'all') && (
            <button
              onClick={onClearSearch}
              className="mt-2 text-blue-500 hover:text-blue-700"
            >
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <InterventionsCardList
          interventions={filteredInterventions}
          emptyMessage="Aucune intervention disponible."
          isMobile={isMobile}
          onViewDetails={onViewDetails}
          onStartWork={onStartWork}
        />
      )}
    </div>
  );
};

export default InterventionsList;
