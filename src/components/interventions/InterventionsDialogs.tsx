
import React from 'react';
import { Intervention } from '@/types/Intervention';
import NewInterventionDialog from './NewInterventionDialog';
import InterventionDetailsDialog from './InterventionDetailsDialog';

interface InterventionsDialogsProps {
  isNewInterventionDialogOpen: boolean;
  onCloseNewInterventionDialog: () => void;
  onCreate: (values: any) => void;
  interventionDetailsOpen: boolean;
  selectedInterventionId: number | string | null;
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
  interventions,
  filteredInterventions
}) => {
  // Mock data for dropdown menus
  const equipments = [
    { id: 1, name: "John Deere 8R 410" },
    { id: 2, name: "New Holland T7.315" },
    { id: 3, name: "Kubota M7-172" },
    { id: 4, name: "Fendt 724 Vario" }
  ];

  const technicians = [
    { id: "1", name: "Robert Taylor" },
    { id: "2", name: "Sarah Johnson" },
    { id: "3", name: "David Chen" },
    { id: "4", name: "Maria Rodriguez" }
  ];

  // Trouver l'intervention sélectionnée
  const selectedIntervention = selectedInterventionId 
    ? interventions.find(i => i.id === selectedInterventionId) 
    : null;

  return (
    <>
      {/* Dialog de création d'intervention */}
      <NewInterventionDialog 
        open={isNewInterventionDialogOpen} 
        onOpenChange={(open) => {
          if (!open) onCloseNewInterventionDialog();
        }}
        onCreate={onCreate}
        equipments={equipments}
        technicians={technicians}
      />
      
      {/* Dialog des détails d'intervention */}
      {selectedInterventionId && (
        <InterventionDetailsDialog
          interventionId={selectedInterventionId}
          open={interventionDetailsOpen}
          onOpenChange={onCloseInterventionDetails}
          onStartWork={() => {
            if (selectedIntervention) {
              onStartWork(selectedIntervention);
            }
          }}
        />
      )}
    </>
  );
};

export default InterventionsDialogs;
