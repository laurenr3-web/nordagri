
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import InterventionsList from './InterventionsList';
import { Intervention } from '@/types/Intervention';

interface InterventionsContainerProps {
  filteredInterventions: Intervention[];
  currentView: string;
  setCurrentView: (view: string) => void;
  onClearSearch: () => void;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
  searchQuery: string;
  selectedPriority: string | null;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriorityChange: (priority: string | null) => void;
}

const InterventionsContainer: React.FC<InterventionsContainerProps> = ({
  filteredInterventions,
  currentView,
  setCurrentView,
  onClearSearch,
  onViewDetails,
  onStartWork,
  searchQuery,
  selectedPriority,
  onSearchChange,
  onPriorityChange
}) => {
  return (
    <div className="container py-4">
      <InterventionsList 
        filteredInterventions={filteredInterventions}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onClearSearch={onClearSearch}
        onViewDetails={onViewDetails}
        onStartWork={onStartWork}
        searchQuery={searchQuery}
        selectedPriority={selectedPriority}
        onSearchChange={onSearchChange}
        onPriorityChange={onPriorityChange}
      />
    </div>
  );
};

export default InterventionsContainer;
