
import React, { useMemo } from 'react';
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

  // Memoize filtered interventions based on the status to avoid recalculating on every render
  const currentInterventions = useMemo(() => {
    if (currentView === 'scheduled') {
      return filteredInterventions.filter(item => item.status === 'scheduled');
    } else if (currentView === 'in-progress') {
      return filteredInterventions.filter(item => item.status === 'in-progress');
    } else if (currentView === 'completed') {
      return filteredInterventions.filter(item => item.status === 'completed');
    }
    return filteredInterventions;
  }, [filteredInterventions, currentView]);

  // Use the memoized interventions for specialized views
  switch (currentView) {
    case 'scheduled':
    case 'in-progress':
    case 'completed':
      return (
        <InterventionsCardList
          interventions={currentInterventions}
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
