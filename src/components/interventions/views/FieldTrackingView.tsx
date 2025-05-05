
import React from 'react';
import { Intervention } from '@/types/Intervention';
import FieldTrackingCard from './field-tracking/FieldTrackingCard';
import AssignTechnicianWrapper from './field-tracking/AssignTechnicianWrapper';

interface FieldTrackingViewProps {
  interventions: Intervention[];
  onViewDetails: (intervention: Intervention) => void;
  onUpdateStatus?: (interventionId: number, newStatus: string) => void;
  onAssignTechnician?: (intervention: Intervention, technician: string) => void;
}

const FieldTrackingView: React.FC<FieldTrackingViewProps> = ({
  interventions,
  onViewDetails,
  onUpdateStatus,
  onAssignTechnician
}) => {
  return (
    <AssignTechnicianWrapper onAssignTechnician={onAssignTechnician}>
      {(handleAssignTechnician) => (
        <FieldTrackingCard
          interventions={interventions}
          onViewDetails={onViewDetails}
          onUpdateStatus={onUpdateStatus}
          onAssignTechnician={handleAssignTechnician}
        />
      )}
    </AssignTechnicianWrapper>
  );
};

export default FieldTrackingView;
