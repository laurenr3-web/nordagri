
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Intervention } from '@/types/Intervention';
import InterventionCard from './InterventionCard';
import { CalendarCheck, Clock, CheckCircle2 } from 'lucide-react';

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

  // Filtrer les interventions en fonction de l'onglet actif
  const getFilteredInterventions = (status: string) => {
    if (status === 'all') return filteredInterventions;
    return filteredInterventions.filter(item => item.status === status);
  };

  return (
    <Tabs value={currentView} defaultValue="all" className="w-full">
      <TabsList className="mb-6 bg-background border">
        <TabsTrigger value="all" className="data-[state=active]:bg-primary/10">
          Toutes
        </TabsTrigger>
        <TabsTrigger value="scheduled" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
          <CalendarCheck size={16} />
          <span>Planifiées</span>
        </TabsTrigger>
        <TabsTrigger value="in-progress" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
          <Clock size={16} />
          <span>En cours</span>
        </TabsTrigger>
        <TabsTrigger value="completed" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
          <CheckCircle2 size={16} />
          <span>Terminées</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-2 space-y-4">
        {filteredInterventions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInterventions.map(intervention => (
              <InterventionCard 
                key={intervention.id} 
                intervention={intervention} 
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            ))}
          </div>
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
      
      <TabsContent value="scheduled" className="mt-2 space-y-4">
        {getFilteredInterventions('scheduled').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredInterventions('scheduled').map(intervention => (
              <InterventionCard 
                key={intervention.id} 
                intervention={intervention} 
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            ))}
          </div>
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
          </BlurContainer>
        )}
      </TabsContent>
      
      <TabsContent value="in-progress" className="mt-2 space-y-4">
        {getFilteredInterventions('in-progress').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredInterventions('in-progress').map(intervention => (
              <InterventionCard 
                key={intervention.id} 
                intervention={intervention} 
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            ))}
          </div>
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
          </BlurContainer>
        )}
      </TabsContent>
      
      <TabsContent value="completed" className="mt-2 space-y-4">
        {getFilteredInterventions('completed').length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getFilteredInterventions('completed').map(intervention => (
              <InterventionCard 
                key={intervention.id} 
                intervention={intervention} 
                onViewDetails={onViewDetails}
                onStartWork={onStartWork}
              />
            ))}
          </div>
        ) : (
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
          </BlurContainer>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default InterventionsList;
