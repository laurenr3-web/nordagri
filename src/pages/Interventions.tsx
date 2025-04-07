import React, { useState, useEffect } from 'react';
import InterventionsHeader from '@/components/interventions/InterventionsHeader';
import InterventionsContainer from '@/components/interventions/InterventionsContainer';
import { useInterventionsState } from '@/hooks/interventions/useInterventionsState';
import { useInterventionsHandlers } from '@/hooks/interventions/useInterventionsHandlers';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import { toast } from 'sonner';
import InterventionsDialogs from '@/components/interventions/InterventionsDialogs';
import { useQueryClient } from '@tanstack/react-query';
import { InterventionFormValues } from '@/types/Intervention';

const InterventionsPage = () => {
  const queryClient = useQueryClient();
  
  // Utiliser le hook pour récupérer les données des interventions depuis Supabase
  const { interventions, isLoading } = useInterventionsData();
  
  // État pour le dialogue de nouvelle intervention
  const [isNewInterventionDialogOpen, setIsNewInterventionDialogOpen] = useState(false);
  
  // Gérer l'état local des interventions et des filtres
  const {
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    interventionDetailsOpen,
    setInterventionDetailsOpen,
    selectedInterventionId,
    setSelectedInterventionId,
    currentView,
    setCurrentView,
    filteredInterventions
  } = useInterventionsState({ 
    initialInterventions: interventions
  });
  
  // Mettre à jour les interventions filtrées quand les interventions changent
  useEffect(() => {
    if (interventions.length > 0) {
      console.log('Interventions récupérées:', interventions);
    }
  }, [interventions]);

  // Utiliser les gestionnaires pour les actions sur les interventions
  const {
    handleOpenNewInterventionDialog,
    handleCloseNewInterventionDialog,
    handleCreateIntervention,
    handleSearchChange,
    handlePriorityChange,
    handleClearSearch,
    handleViewDetails,
    handleCloseInterventionDetails,
    handleStartWork
  } = useInterventionsHandlers({
    interventions,
    isNewInterventionDialogOpen,
    setIsNewInterventionDialogOpen,
    setInterventionDetailsOpen,
    setSelectedInterventionId,
    setSearchQuery,
    setSelectedPriority
  });

  // Gestionnaire pour après la création d'une intervention
  const handleAfterCreateIntervention = async (intervention: InterventionFormValues): Promise<void> => {
    // Rafraîchir les données après création
    queryClient.invalidateQueries({ queryKey: ['interventions'] });
    handleCreateIntervention(intervention);
    return Promise.resolve();
  };

  // Ensure selectedInterventionId is a number or null for the InterventionsDialogs component
  const numericSelectedInterventionId = selectedInterventionId === null 
    ? null 
    : typeof selectedInterventionId === 'string' 
      ? parseInt(selectedInterventionId, 10) 
      : selectedInterventionId;

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Chargement des interventions...</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <InterventionsHeader 
            onNewIntervention={handleOpenNewInterventionDialog} 
            searchQuery={searchQuery}
            onSearchChange={(query) => handleSearchChange({ target: { value: query } } as React.ChangeEvent<HTMLInputElement>)}
            selectedPriority={selectedPriority}
            onPriorityChange={handlePriorityChange}
            currentView={currentView}
            setCurrentView={setCurrentView}
          />

          <InterventionsContainer
            filteredInterventions={filteredInterventions.length > 0 ? filteredInterventions : interventions}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onClearSearch={handleClearSearch}
            onViewDetails={handleViewDetails}
            onStartWork={(intervention) => {
              handleStartWork(intervention);
              toast.success(`Intervention "${intervention.title}" démarrée`);
            }}
            searchQuery={searchQuery}
            selectedPriority={selectedPriority}
            onSearchChange={handleSearchChange}
            onPriorityChange={handlePriorityChange}
          />

          {/* Dialogs for interventions */}
          <InterventionsDialogs
            isNewInterventionDialogOpen={isNewInterventionDialogOpen}
            onCloseNewInterventionDialog={handleCloseNewInterventionDialog}
            onCreate={handleAfterCreateIntervention}
            interventionDetailsOpen={interventionDetailsOpen}
            selectedInterventionId={numericSelectedInterventionId}
            onCloseInterventionDetails={handleCloseInterventionDetails}
            onStartWork={handleStartWork}
            interventions={interventions}
            filteredInterventions={filteredInterventions}
          />
        </div>
      </div>
    </div>
  );
};

export default InterventionsPage;
