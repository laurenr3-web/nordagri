
import React from 'react';
import InterventionsList from './InterventionsList';
import { Intervention } from '@/types/Intervention';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    <ScrollArea className="h-[calc(100vh-180px)] w-full">
      <div className="container py-4 px-4 md:px-6 lg:px-8 max-w-full">
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
    </ScrollArea>
  );
};

export default InterventionsContainer;
