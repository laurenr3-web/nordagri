
import React from 'react';
import { Intervention } from '@/types/Intervention';
import FieldTrackingView from './FieldTrackingView';
import RequestsManagementView from './RequestsManagementView';
import EquipmentHistoryView from './EquipmentHistoryView';
import FieldObservationsView from './FieldObservationsView';
import { useIsMobile } from '@/hooks/use-mobile';
import InterventionsCardList from '../cards/InterventionsCardList';
import { getEmptyStateMessage } from '../utils/messageUtils';

interface InterventionContentRendererProps {
  currentView: string;
  filteredInterventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
}

const InterventionContentRenderer: React.FC<InterventionContentRendererProps> = ({
  currentView,
  filteredInterventions,
  onViewDetails,
  onStartWork
}) => {
  const isMobile = useIsMobile();

  // Filtrer les interventions en fonction de l'onglet actif
  const getFilteredInterventions = (status: string) => {
    if (status === 'all') return filteredInterventions;
    return filteredInterventions.filter(item => item.status === status);
  };

  // Fonction pour afficher le contenu en fonction de l'onglet actif
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

export default InterventionContentRenderer;
