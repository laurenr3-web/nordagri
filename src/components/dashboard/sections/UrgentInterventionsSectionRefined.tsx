
import React from 'react';
import { DashboardSection } from './DashboardSection';
import { UrgentInterventionsTable } from '@/components/dashboard/UrgentInterventionsTable';
import { UrgentIntervention } from '@/types/Intervention';

interface UrgentInterventionsSectionRefinedProps {
  interventions: UrgentIntervention[];
  isEditing: boolean;
  onViewAll: () => void;
  onViewDetails: (id: number) => void;
}

export const UrgentInterventionsSectionRefined: React.FC<UrgentInterventionsSectionRefinedProps> = ({
  interventions,
  isEditing,
  onViewAll,
  onViewDetails
}) => {
  return (
    <DashboardSection
      id="urgent-interventions"
      title="Interventions urgentes"
      subtitle="Interventions critiques en attente"
      isEditing={isEditing}
      actionLabel="Toutes les interventions"
      onAction={onViewAll}
    >
      <UrgentInterventionsTable 
        interventions={interventions} 
        onViewDetails={onViewDetails} 
      />
    </DashboardSection>
  );
};
