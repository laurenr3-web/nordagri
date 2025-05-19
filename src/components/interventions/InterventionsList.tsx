
import React from 'react';
import { Intervention } from '@/types/Intervention';
import InterventionTabs from './navigation/InterventionTabs';
import InterventionContentRenderer from './views/InterventionContentRenderer';

interface InterventionsListProps {
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

const InterventionsList: React.FC<InterventionsListProps> = ({
  filteredInterventions,
  currentView,
  setCurrentView,
  onViewDetails,
  onStartWork
}) => {
  // Obtenez les nombres pour chaque catégorie
  const scheduledCount = filteredInterventions.filter(item => item.status === 'scheduled').length;
  const inProgressCount = filteredInterventions.filter(item => item.status === 'in-progress').length;
  const completedCount = filteredInterventions.filter(item => item.status === 'completed').length;

  const handleTabClick = (path: string | undefined) => {
    if (path) {
      setCurrentView(path);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        <InterventionTabs
          scheduledCount={scheduledCount}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
          currentView={currentView}
          onTabClick={handleTabClick}
        />

        <div className="px-0">
          <InterventionContentRenderer 
            currentView={currentView}
            filteredInterventions={filteredInterventions}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        </div>
      </div>
    </div>
  );
};

export default InterventionsList;
