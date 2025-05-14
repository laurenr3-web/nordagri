import React, { useState, useEffect } from 'react';
import MainLayout from '@/ui/layouts/MainLayout';
import InterventionsHeader from '@/components/interventions/InterventionsHeader';
import InterventionsContainer from '@/components/interventions/InterventionsContainer';
import { useInterventionsState } from '@/hooks/interventions/useInterventionsState';
import { useInterventionsHandlers } from '@/hooks/interventions/useInterventionsHandlers';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import InterventionsDialogs from '@/components/interventions/InterventionsDialogs';
import { useQueryClient } from '@tanstack/react-query';
import { InterventionFormValues } from '@/types/Intervention';
import { toast } from 'sonner';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

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
      // Mettre à jour l'état avec les interventions récupérées
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

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <MainLayout>
        <LayoutWrapper>
          <div className="flex-1 flex items-center justify-center">
            <p>Chargement des interventions...</p>
          </div>
        </LayoutWrapper>
      </MainLayout>
    );
  }

  // Ensure selectedInterventionId is a number or null for the InterventionsDialogs component
  const numericSelectedInterventionId = selectedInterventionId === null 
    ? null 
    : typeof selectedInterventionId === 'string' 
      ? parseInt(selectedInterventionId, 10) 
      : selectedInterventionId;

  return (
    <MainLayout>
      <LayoutWrapper>
        <PageHeader 
          title="Interventions"
          description="Planifiez et suivez les interventions sur vos équipements"
          action={
            <Button 
              onClick={handleOpenNewInterventionDialog}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" /> Nouvelle intervention
            </Button>
          }
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

        {/* Toaster pour les notifications */}
        <Toaster />
      </LayoutWrapper>
    </MainLayout>
  );
};

export default InterventionsPage;
