
import React from 'react';
import InterventionsList from '@/components/interventions/InterventionsList';
import InterventionsSidebar from '@/components/interventions/InterventionsSidebar';
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
    <div className="container relative pb-6 pt-8 md:pb-12 md:pt-12 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="col-span-1 lg:col-span-3">
          <InterventionsList
            filteredInterventions={filteredInterventions}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onClearSearch={onClearSearch}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        </div>

        <div className="col-span-1 hidden lg:block">
          <InterventionsSidebar
            interventions={filteredInterventions}
            onViewDetails={onViewDetails}
            searchQuery={searchQuery}
            selectedPriority={selectedPriority}
            onSearchChange={onSearchChange}
            onPriorityChange={onPriorityChange}
            onClearSearch={onClearSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default InterventionsContainer;
