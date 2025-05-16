
import React, { useState } from 'react';
import NewInterventionDialog from './NewInterventionDialog';
import InterventionDetailsDialog from './InterventionDetailsDialog';
import InterventionReportPdfDialog from './dialogs/InterventionReportPdfDialog';
import { useInterventionDetail } from '@/hooks/interventions/useInterventionDetail';
import { Intervention, InterventionFormValues } from '@/types/Intervention';

interface InterventionsDialogsProps {
  isNewInterventionDialogOpen: boolean;
  onCloseNewInterventionDialog: () => void;
  onCreate: (values: InterventionFormValues) => Promise<void>;
  interventionDetailsOpen: boolean;
  selectedInterventionId: number | null;
  onCloseInterventionDetails: () => void;
  onStartWork: (intervention: Intervention) => void;
  interventions: Intervention[];
  filteredInterventions: Intervention[];
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
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  
  // Récupérer les détails de l'intervention sélectionnée
  const { intervention, loading, handleInterventionUpdate } = useInterventionDetail(selectedInterventionId);
  
  return (
    <>
      {/* Dialog for creating a new intervention */}
      <NewInterventionDialog
        open={isNewInterventionDialogOpen}
        onOpenChange={(open) => {
          if (!open) onCloseNewInterventionDialog();
        }}
        onCreate={onCreate}
      />
      
      {/* Dialog for viewing/editing intervention details */}
      {selectedInterventionId !== null && (
        <InterventionDetailsDialog
          open={interventionDetailsOpen}
          onOpenChange={(open) => {
            if (!open) onCloseInterventionDetails();
          }}
          interventionId={selectedInterventionId}
          onUpdate={handleInterventionUpdate}
          onStartWork={onStartWork}
          onGenerateReport={() => setIsReportDialogOpen(true)}
          loading={loading}
        />
      )}
      
      {/* Dialog for generating PDF report */}
      {intervention && (
        <InterventionReportPdfDialog
          open={isReportDialogOpen}
          onOpenChange={setIsReportDialogOpen}
          intervention={intervention}
        />
      )}
    </>
  );
};

export default InterventionsDialogs;
