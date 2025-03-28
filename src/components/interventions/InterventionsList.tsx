
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Intervention } from '@/types/Intervention';
import InterventionCard from './InterventionCard';
import { CalendarCheck, Clock, CheckCircle2, Wrench, AlertTriangle } from 'lucide-react';
import InterventionsNavigation from './InterventionsNavigation';

interface InterventionsListProps {
  filteredInterventions: Intervention[];
  currentView: string;
  setCurrentView: (view: string) => void;
  onClearSearch: () => void;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionsList: React.FC<InterventionsListProps> = ({
  filteredInterventions,
  currentView,
  setCurrentView,
  onClearSearch,
  onViewDetails,
  onStartWork
}) => {
  const getEmptyStateMessage = () => {
    switch (currentView) {
      case 'scheduled':
        return 'Aucune intervention planifiée.';
      case 'in-progress':
        return 'Aucune intervention en cours.';
      case 'completed':
        return 'Aucune intervention terminée.';
      case 'by-type':
        return 'Aucune intervention à afficher par type.';
      case 'by-priority':
        return 'Aucune intervention à afficher par priorité.';
      case 'calendar':
        return 'Aucune intervention à afficher dans le calendrier.';
      default:
        return 'Aucune intervention trouvée correspondant à vos critères de recherche.';
    }
  };

  // Filtrer les interventions en fonction de l'onglet actif
  const getFilteredInterventions = (status: string) => {
    if (status === 'all') return filteredInterventions;
    return filteredInterventions.filter(item => item.status === status);
  };

  // Obtenez les nombres pour chaque catégorie
  const scheduledCount = filteredInterventions.filter(item => item.status === 'scheduled').length;
  const inProgressCount = filteredInterventions.filter(item => item.status === 'in-progress').length;
  const completedCount = filteredInterventions.filter(item => item.status === 'completed').length;

  return (
    <>
      <InterventionsNavigation 
        setCurrentView={setCurrentView}
        currentView={currentView}
      />
      
      <Tabs value={currentView} defaultValue="scheduled" className="w-full" onValueChange={setCurrentView}>
        <TabsList className="mb-6 bg-background border">
          <TabsTrigger value="scheduled" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
            <CalendarCheck size={16} />
            <span>Planifiées ({scheduledCount})</span>
          </TabsTrigger>
          <TabsTrigger value="in-progress" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
            <Clock size={16} />
            <span>En cours ({inProgressCount})</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
            <CheckCircle2 size={16} />
            <span>Terminées ({completedCount})</span>
          </TabsTrigger>
          <TabsTrigger value="by-type" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
            <Wrench size={16} />
            <span>Par Type</span>
          </TabsTrigger>
          <TabsTrigger value="by-priority" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
            <AlertTriangle size={16} />
            <span>Par Priorité</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
            <CalendarCheck size={16} />
            <span>Calendrier</span>
          </TabsTrigger>
        </TabsList>

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
        
        <TabsContent value="by-type" className="mt-2 space-y-4">
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">Fonctionnalité à venir: Affichage des interventions par type.</p>
          </BlurContainer>
        </TabsContent>
        
        <TabsContent value="by-priority" className="mt-2 space-y-4">
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">Fonctionnalité à venir: Affichage des interventions par priorité.</p>
          </BlurContainer>
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-2 space-y-4">
          <BlurContainer className="p-8 text-center">
            <p className="text-muted-foreground">Fonctionnalité à venir: Affichage des interventions dans un calendrier.</p>
          </BlurContainer>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default InterventionsList;
