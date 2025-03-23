
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { TabsContent } from '@/components/ui/tabs';
import { Intervention } from '@/types/Intervention';
import InterventionCard from './InterventionCard';

interface InterventionsListProps {
  filteredInterventions: Intervention[];
  currentView: string;
  onClearSearch: () => void;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionsList: React.FC<InterventionsListProps> = ({
  filteredInterventions,
  currentView,
  onClearSearch,
  onViewDetails,
  onStartWork
}) => {
  const getEmptyStateMessage = () => {
    switch (currentView) {
      case 'scheduled':
        return 'No scheduled interventions found.';
      case 'in-progress':
        return 'No interventions currently in progress.';
      case 'completed':
        return 'No completed interventions found.';
      default:
        return 'No interventions found matching your search criteria.';
    }
  };

  return (
    <>
      <TabsContent value="all" className="mt-6 space-y-4">
        {filteredInterventions.length > 0 ? (
          filteredInterventions.map(intervention => (
            <InterventionCard 
              key={intervention.id} 
              intervention={intervention} 
              onViewDetails={onViewDetails}
              onStartWork={onStartWork}
            />
          ))
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
            {currentView === 'all' && (
              <Button variant="link" onClick={onClearSearch}>
                Clear search
              </Button>
            )}
          </BlurContainer>
        )}
      </TabsContent>
      
      <TabsContent value="scheduled" className="mt-6 space-y-4">
        {filteredInterventions.length > 0 ? (
          filteredInterventions.map(intervention => (
            <InterventionCard 
              key={intervention.id} 
              intervention={intervention} 
              onViewDetails={onViewDetails}
              onStartWork={onStartWork}
            />
          ))
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
          </BlurContainer>
        )}
      </TabsContent>
      
      <TabsContent value="in-progress" className="mt-6 space-y-4">
        {filteredInterventions.length > 0 ? (
          filteredInterventions.map(intervention => (
            <InterventionCard 
              key={intervention.id} 
              intervention={intervention} 
              onViewDetails={onViewDetails}
              onStartWork={onStartWork}
            />
          ))
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
          </BlurContainer>
        )}
      </TabsContent>
      
      <TabsContent value="completed" className="mt-6 space-y-4">
        {filteredInterventions.length > 0 ? (
          filteredInterventions.map(intervention => (
            <InterventionCard 
              key={intervention.id} 
              intervention={intervention} 
              onViewDetails={onViewDetails}
              onStartWork={onStartWork}
            />
          ))
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
          </BlurContainer>
        )}
      </TabsContent>
    </>
  );
};

export default InterventionsList;
