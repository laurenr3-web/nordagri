
import React from 'react';
import { Intervention } from '@/types/Intervention';
import FieldTrackingView from './views/FieldTrackingView';
import RequestsManagementView from './views/RequestsManagementView';
import EquipmentHistoryView from './views/EquipmentHistoryView';
import FieldObservationsView from './views/FieldObservationsView';
import { useIsMobile } from '@/hooks/use-mobile';
import InterventionTabs from './navigation/InterventionTabs';
import InterventionsCardList from './cards/InterventionsCardList';
import { getEmptyStateMessage } from './utils/messageUtils';

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

  // Filtrer les interventions en fonction de l'onglet actif
  const getFilteredInterventions = (status: string) => {
    if (status === 'all') return filteredInterventions;
    return filteredInterventions.filter(item => item.status === status);
  };

  // Obtenez les nombres pour chaque catégorie
  const scheduledCount = filteredInterventions.filter(item => item.status === 'scheduled').length;
  const inProgressCount = filteredInterventions.filter(item => item.status === 'in-progress').length;
  const completedCount = filteredInterventions.filter(item => item.status === 'completed').length;

  const handleTabClick = (path: string | undefined) => {
    if (path) {
      setCurrentView(path);
    }
  };

  // Fonction pour afficher le contenu en fonction de l'onglet actif
  const renderContent = () => {
    switch (currentView) {
      case 'scheduled':
        return (
          <InterventionsCardList
            interventions={getFilteredInterventions('scheduled')}
            emptyMessage={getEmptyStateMessage(currentView)}
            isMobile={isMobile}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        );
      case 'in-progress':
        return (
          <InterventionsCardList
            interventions={getFilteredInterventions('in-progress')}
            emptyMessage={getEmptyStateMessage(currentView)}
            isMobile={isMobile}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        );
      case 'completed':
        return (
          <InterventionsCardList
            interventions={getFilteredInterventions('completed')}
            emptyMessage={getEmptyStateMessage(currentView)}
            isMobile={isMobile}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        );
      case 'field-tracking':
        return <FieldTrackingView interventions={filteredInterventions} onViewDetails={onViewDetails} />;
      case 'requests':
        return <RequestsManagementView interventions={filteredInterventions} onViewDetails={onViewDetails} />;
      case 'observations':
        return <FieldObservationsView />;
      case 'history':
        return <EquipmentHistoryView interventions={filteredInterventions} onViewDetails={onViewDetails} />;
      default:
        return (
          <InterventionsCardList
            interventions={filteredInterventions}
            emptyMessage={getEmptyStateMessage(currentView)}
            isMobile={isMobile}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        );
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default InterventionsList;
