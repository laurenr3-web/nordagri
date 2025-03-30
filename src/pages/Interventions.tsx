
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import Navbar from '@/components/layout/Navbar';
import InterventionsHeader from '@/components/interventions/InterventionsHeader';
import InterventionsContainer from '@/components/interventions/InterventionsContainer';
import InterventionsDialogs from '@/components/interventions/InterventionsDialogs';
import { useInterventionsState } from '@/hooks/interventions/useInterventionsState';
import { useInterventionsHandlers } from '@/hooks/interventions/useInterventionsHandlers';
import { sampleInterventions } from '@/data/sampleInterventions';

const InterventionsPage = () => {
  // Use the custom hooks to manage state and handlers
  const {
    interventions,
    setInterventions,
    searchQuery,
    setSearchQuery,
    selectedPriority,
    setSelectedPriority,
    isNewInterventionDialogOpen,
    setIsNewInterventionDialogOpen,
    interventionDetailsOpen,
    setInterventionDetailsOpen,
    selectedInterventionId,
    setSelectedInterventionId,
    currentView,
    setCurrentView,
    filteredInterventions
  } = useInterventionsState({ initialInterventions: sampleInterventions });

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
    setInterventions,
    setIsNewInterventionDialogOpen,
    setInterventionDetailsOpen,
    setSelectedInterventionId,
    setSearchQuery,
    setSelectedPriority
  });

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Navbar />

        <div className="flex flex-1 flex-col">
          <InterventionsHeader onNewIntervention={handleOpenNewInterventionDialog} />

          <InterventionsContainer
            filteredInterventions={filteredInterventions}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onClearSearch={handleClearSearch}
            onViewDetails={handleViewDetails}
            onStartWork={handleStartWork}
            searchQuery={searchQuery}
            selectedPriority={selectedPriority}
            onSearchChange={handleSearchChange}
            onPriorityChange={handlePriorityChange}
          />

          <InterventionsDialogs
            isNewInterventionDialogOpen={isNewInterventionDialogOpen}
            onCloseNewInterventionDialog={handleCloseNewInterventionDialog}
            onCreate={handleCreateIntervention}
            interventionDetailsOpen={interventionDetailsOpen}
            selectedInterventionId={selectedInterventionId}
            onCloseInterventionDetails={handleCloseInterventionDetails}
            onStartWork={handleStartWork}
            interventions={interventions}
          />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default InterventionsPage;
