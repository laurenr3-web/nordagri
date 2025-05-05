
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Intervention } from '@/types/Intervention';
import InterventionCard from './InterventionCard';
import { CalendarCheck, Clock, CheckCircle2, Wrench, FileText, Eye, History } from 'lucide-react';
import FieldTrackingView from './views/FieldTrackingView';
import RequestsManagementView from './views/RequestsManagementView';
import EquipmentHistoryView from './views/EquipmentHistoryView';
import FieldObservationsView from './views/FieldObservationsView';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useIsMobile } from '@/hooks/use-mobile';

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
  onClearSearch,
  onViewDetails,
  onStartWork,
  searchQuery,
  selectedPriority,
  onSearchChange,
  onPriorityChange
}) => {
  const isMobile = useIsMobile();

  const getEmptyStateMessage = () => {
    switch (currentView) {
      case 'scheduled':
        return 'Aucune intervention planifiée.';
      case 'in-progress':
        return 'Aucune intervention en cours.';
      case 'completed':
        return 'Aucune intervention terminée.';
      case 'field-tracking':
        return 'Aucune intervention terrain à suivre.';
      case 'requests':
        return 'Aucune demande d\'intervention.';
      case 'history':
        return 'Aucun historique d\'intervention.';
      case 'observations':
        return 'Aucune observation terrain trouvée.';
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

  // Rendu des cartes d'intervention
  const renderInterventionCards = (interventions: Intervention[]) => {
    if (interventions.length === 0) {
      return (
        <BlurContainer className="p-8 text-center">
          <p className="text-muted-foreground">{getEmptyStateMessage()}</p>
        </BlurContainer>
      );
    }

    // Sur mobile, utiliser un carrousel pour afficher les interventions
    if (isMobile) {
      return (
        <Carousel
          className="w-full"
          opts={{ 
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent className="-ml-2 -mr-2">
            {interventions.map((intervention) => (
              <CarouselItem key={intervention.id} className="pl-2 pr-2 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <InterventionCard
                    intervention={intervention}
                    onViewDetails={onViewDetails}
                    onStartWork={onStartWork}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="relative static mr-2" />
            <CarouselNext className="relative static ml-2" />
          </div>
        </Carousel>
      );
    }

    // Sur desktop, utiliser la grille
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {interventions.map(intervention => (
          <InterventionCard 
            key={intervention.id} 
            intervention={intervention} 
            onViewDetails={onViewDetails} 
            onStartWork={onStartWork} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full">
      <Tabs value={currentView} defaultValue="scheduled" onValueChange={setCurrentView} className="w-full">
        <ScrollArea className="w-full overflow-x-auto pb-2">
          <TabsList className="mb-6 bg-background border w-auto min-w-max flex">
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
            <TabsTrigger value="field-tracking" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
              <Wrench size={16} />
              <span>Suivi Terrain</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
              <FileText size={16} />
              <span>Demandes</span>
            </TabsTrigger>
            <TabsTrigger value="observations" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
              <Eye size={16} />
              <span>Observations</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-primary/10 flex items-center gap-1">
              <History size={16} />
              <span>Historique</span>
            </TabsTrigger>
          </TabsList>
        </ScrollArea>

        <div className="px-0 overflow-x-hidden">
          <TabsContent value="scheduled" className="mt-2 w-full">
            {renderInterventionCards(getFilteredInterventions('scheduled'))}
          </TabsContent>
          
          <TabsContent value="in-progress" className="mt-2 w-full">
            {renderInterventionCards(getFilteredInterventions('in-progress'))}
          </TabsContent>
          
          <TabsContent value="completed" className="mt-2 w-full">
            {renderInterventionCards(getFilteredInterventions('completed'))}
          </TabsContent>
          
          <TabsContent value="field-tracking" className="mt-2 w-full">
            <FieldTrackingView interventions={filteredInterventions} onViewDetails={onViewDetails} />
          </TabsContent>
          
          <TabsContent value="requests" className="mt-2 w-full">
            <RequestsManagementView interventions={filteredInterventions} onViewDetails={onViewDetails} />
          </TabsContent>
          
          <TabsContent value="observations" className="mt-2 w-full">
            <FieldObservationsView />
          </TabsContent>
          
          <TabsContent value="history" className="mt-2 w-full">
            <EquipmentHistoryView interventions={filteredInterventions} onViewDetails={onViewDetails} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default InterventionsList;
