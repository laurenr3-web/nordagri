
import React from 'react';
import { BlurContainer } from '@/components/ui/blur-container';
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
import { ExpandableTabs, TabItem } from '@/components/ui/expandable-tabs';

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

  // Définir les onglets avec les icônes et compteurs
  const navigationTabs: TabItem[] = [
    {
      title: `Planifiées (${scheduledCount})`,
      icon: CalendarCheck,
      path: 'scheduled'
    },
    {
      title: `En cours (${inProgressCount})`,
      icon: Clock,
      path: 'in-progress'
    },
    {
      title: `Terminées (${completedCount})`,
      icon: CheckCircle2,
      path: 'completed'
    },
    {
      title: 'Suivi Terrain',
      icon: Wrench,
      path: 'field-tracking'
    },
    {
      title: 'Demandes',
      icon: FileText,
      path: 'requests'
    },
    {
      title: 'Observations',
      icon: Eye,
      path: 'observations'
    },
    {
      title: 'Historique',
      icon: History,
      path: 'history'
    }
  ];

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

  // Fonction pour afficher le contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (currentView) {
      case 'scheduled':
        return renderInterventionCards(getFilteredInterventions('scheduled'));
      case 'in-progress':
        return renderInterventionCards(getFilteredInterventions('in-progress'));
      case 'completed':
        return renderInterventionCards(getFilteredInterventions('completed'));
      case 'field-tracking':
        return <FieldTrackingView interventions={filteredInterventions} onViewDetails={onViewDetails} />;
      case 'requests':
        return <RequestsManagementView interventions={filteredInterventions} onViewDetails={onViewDetails} />;
      case 'observations':
        return <FieldObservationsView />;
      case 'history':
        return <EquipmentHistoryView interventions={filteredInterventions} onViewDetails={onViewDetails} />;
      default:
        return renderInterventionCards(filteredInterventions);
    }
  };

  const handleTabClick = (path: string | undefined) => {
    if (path) {
      setCurrentView(path);
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-6">
        <ScrollArea className="w-full overflow-x-auto pb-2">
          <ExpandableTabs
            tabs={navigationTabs}
            activeColor="text-primary"
            currentPath={currentView}
            onTabClick={handleTabClick}
            className="w-full mb-6 justify-start overflow-x-auto flex-nowrap scrollbar-hide"
          />
        </ScrollArea>

        <div className="px-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InterventionsList;
