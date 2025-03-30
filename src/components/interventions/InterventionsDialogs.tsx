
import React from 'react';
import NewInterventionDialog from '@/components/interventions/NewInterventionDialog';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import { Intervention } from '@/types/Intervention';

interface InterventionsDialogsProps {
  isNewInterventionDialogOpen: boolean;
  onCloseNewInterventionDialog: () => void;
  onCreate: (newIntervention: Partial<Intervention>) => void;
  interventionDetailsOpen: boolean;
  selectedInterventionId: number | string | null;
  onCloseInterventionDetails: () => void;
  onStartWork: (intervention: Intervention) => void;
  interventions: Intervention[];
}

const InterventionsDialogs: React.FC<InterventionsDialogsProps> = ({
  isNewInterventionDialogOpen,
  onCloseNewInterventionDialog,
  onCreate,
  interventionDetailsOpen,
  selectedInterventionId,
  onCloseInterventionDetails,
  onStartWork,
  interventions
}) => {
  return (
    <>
      <NewInterventionDialog
        open={isNewInterventionDialogOpen}
        onOpenChange={onCloseNewInterventionDialog}
        onCreate={onCreate}
      />

      <InterventionDetailsDialog
        interventionId={selectedInterventionId || ''}
        open={interventionDetailsOpen}
        onOpenChange={onCloseInterventionDetails}
        onStartWork={() => {
          if (selectedInterventionId) {
            const intervention = interventions.find(i => i.id === selectedInterventionId);
            if (intervention) {
              onStartWork(intervention);
            }
          }
        }}
      />
    </>
  );
};

export default InterventionsDialogs;
