
import React from 'react';
import { DashboardSection } from '@/components/dashboard/sections/DashboardSection';
import { UrgentInterventionsTable } from '@/components/dashboard/UrgentInterventionsTable';
import { UrgentIntervention } from '@/types/Intervention';

interface DashboardInterventionsProps {
  interventions: UrgentIntervention[];
  isEditing: boolean;
  onViewAll: () => void;
  onViewDetails: (id: number) => void;
}

export const DashboardInterventions: React.FC<DashboardInterventionsProps> = ({
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
