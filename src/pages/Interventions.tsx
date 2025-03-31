
import React, { useState, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import InterventionsHeader from '@/components/interventions/InterventionsHeader';
import InterventionsContainer from '@/components/interventions/InterventionsContainer';
import { useInterventionsState } from '@/hooks/interventions/useInterventionsState';
import { useInterventionsHandlers } from '@/hooks/interventions/useInterventionsHandlers';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import InterventionDetailsDialog from '@/components/interventions/InterventionDetailsDialog';
import { toast } from 'sonner';

const InterventionsPage = () => {
  // Utiliser le hook pour récupérer les données des interventions depuis Supabase
  const { interventions, isLoading } = useInterventionsData();
  
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
    setIsNewInterventionDialogOpen: (open) => {
      // Ouvrir le dialogue de création
      handleOpenNewInterventionDialog();
    },
    setInterventionDetailsOpen,
    setSelectedInterventionId,
    setSearchQuery,
    setSelectedPriority
  });

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-background">
          <Navbar />
          <div className="flex flex-1 flex-col items-center justify-center">
            <p>Chargement des interventions...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Navbar />

        <div className="flex flex-1 flex-col">
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

          {/* Dialog des détails d'intervention */}
          <InterventionDetailsDialog
            interventionId={selectedInterventionId || ''}
            open={interventionDetailsOpen}
            onOpenChange={handleCloseInterventionDetails}
            onStartWork={() => {
              if (selectedInterventionId) {
                const intervention = interventions.find(i => i.id === selectedInterventionId);
                if (intervention) {
                  handleStartWork(intervention);
                }
              }
            }}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InterventionsPage;
