
import React, { useMemo } from 'react';
import { Intervention } from '@/types/Intervention';
import { ScrollArea } from '@/components/ui/scroll-area';
import InterventionTabs from './navigation/InterventionTabs';
import InterventionContentRenderer from './views/InterventionContentRenderer';

interface InterventionsContainerProps {
  filteredInterventions: Intervention[];
  currentView: string;
  setCurrentView: (view: string) => void;
  onClearSearch: () => void;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionsContainer: React.FC<InterventionsContainerProps> = ({
  filteredInterventions,
  currentView,
  setCurrentView,
  onClearSearch,
  onViewDetails,
  onStartWork
}) => {
  // Calculate counts for the navigation tabs
  const scheduledCount = useMemo(() => 
    filteredInterventions.filter(i => i.status === 'scheduled').length, 
    [filteredInterventions]
  );
  
  const inProgressCount = useMemo(() => 
    filteredInterventions.filter(i => i.status === 'in-progress').length, 
    [filteredInterventions]
  );
  
  const completedCount = useMemo(() => 
    filteredInterventions.filter(i => i.status === 'completed').length, 
    [filteredInterventions]
  );

  // Handle tab navigation
  const handleTabClick = (path: string | undefined) => {
    if (path) {
      setCurrentView(path);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="container py-2 px-4">
        <InterventionTabs 
          scheduledCount={scheduledCount}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
          currentView={currentView}
          onTabClick={handleTabClick}
        />
        
        <InterventionContentRenderer 
          currentView={currentView}
          filteredInterventions={filteredInterventions}
          onViewDetails={onViewDetails}
          onStartWork={onStartWork}
        />
      </div>
    </div>
  );
};

export default InterventionsContainer;
