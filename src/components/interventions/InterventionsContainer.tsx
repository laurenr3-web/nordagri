
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
    <ScrollArea className="h-[calc(100vh-180px)] w-full">
      <div className="container py-4 px-4 md:px-6 lg:px-8 max-w-full">
        {/* Navigation Tabs */}
        <InterventionTabs 
          scheduledCount={scheduledCount}
          inProgressCount={inProgressCount}
          completedCount={completedCount}
          currentView={currentView}
          onTabClick={handleTabClick}
        />

        {/* Content Renderer for different views */}
        <InterventionContentRenderer 
          currentView={currentView}
          filteredInterventions={filteredInterventions}
          onViewDetails={onViewDetails}
          onStartWork={onStartWork}
        />
      </div>
    </ScrollArea>
  );
};

export default InterventionsContainer;
