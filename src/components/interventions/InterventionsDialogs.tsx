
import React from 'react';
import NewInterventionDialog from './NewInterventionDialog';
import InterventionDetailsDialog from './InterventionDetailsDialog';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

interface InterventionsDialogsProps {
  isNewInterventionDialogOpen: boolean;
  onCloseNewInterventionDialog: () => void;
  onCreate: (intervention: InterventionFormValues) => void;
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
  interventions,
  filteredInterventions
}) => {
  const { createIntervention } = useInterventionsData();
  
  // Récupérer les équipements depuis la base de données
  const { data: equipments = [], isLoading: isLoadingEquipments } = useQuery({
    queryKey: ['equipments'],
    queryFn: async () => {
      try {
        // Simuler une récupération des équipements
        // Dans un cas réel, vous appellerez votre API
        return [
          { id: 1, name: "John Deere 8R 410" },
          { id: 2, name: "New Holland T7.315" },
          { id: 3, name: "Kubota M7-172" },
          { id: 4, name: "Fendt 724 Vario" }
        ];
      } catch (error) {
        console.error('Error fetching equipments:', error);
        toast.error('Impossible de récupérer les équipements');
        return [];
      }
    }
  });
  
  // Récupérer les techniciens depuis la base de données
  const { data: technicians = [], isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      try {
        // Simuler une récupération des techniciens
        return [
          { id: "1", name: "Robert Taylor" },
          { id: "2", name: "Sarah Johnson" },
          { id: "3", name: "David Chen" },
          { id: "4", name: "Maria Rodriguez" }
        ];
      } catch (error) {
        console.error('Error fetching technicians:', error);
        toast.error('Impossible de récupérer les techniciens');
        return [];
      }
    }
  });
  
  // Trouver l'intervention sélectionnée pour les détails
  const selectedIntervention = selectedInterventionId
    ? interventions.find(i => i.id === selectedInterventionId) || null
    : null;
  
  // Wrapper pour la création d'intervention qui utilise notre service
  const handleCreateIntervention = async (values: InterventionFormValues) => {
    try {
      await createIntervention(values);
      toast.success("Intervention créée avec succès");
      // Appeler le onCreate du parent pour mettre à jour l'UI
      onCreate(values);
      return Promise.resolve();
    } catch (error) {
      console.error("Error in handleCreateIntervention:", error);
      toast.error("Erreur lors de la création de l'intervention");
      return Promise.reject(error);
    }
  };
  
  return (
    <>
      {/* Dialog pour créer une nouvelle intervention */}
      <NewInterventionDialog
        open={isNewInterventionDialogOpen}
        onOpenChange={onCloseNewInterventionDialog}
        onCreate={handleCreateIntervention}
        equipments={equipments}
        technicians={technicians}
        isLoadingEquipment={isLoadingEquipments}
        isLoadingTechnicians={isLoadingTechnicians}
      />
      
      {/* Dialog pour voir les détails d'une intervention */}
      {selectedIntervention && selectedInterventionId && (
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
