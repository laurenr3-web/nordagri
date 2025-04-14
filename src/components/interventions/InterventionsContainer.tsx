
// Fixing the assignTechnician parameter type
import React, { useState, useMemo, useCallback } from 'react';
import InterventionsList from '@/components/interventions/InterventionsList';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import NewInterventionDialog from './NewInterventionDialog';
import InterventionReportDialog from './dialogs/InterventionReportDialog';
import CalendarView from './views/CalendarView';
import FieldTrackingView from './views/FieldTrackingView';
import { useInterventionFormHandlers } from '@/hooks/interventions/useInterventionFormHandlers';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ensureNumberId } from '@/utils/typeGuards';

interface InterventionsContainerProps {
  filteredInterventions: Intervention[];
  currentView: string;
  setCurrentView: (view: string) => void;
  onClearSearch: () => void;
  onViewDetails: (intervention: Intervention) => void;
  onStartWork: (intervention: Intervention) => void;
  searchQuery: string;
  selectedPriority: string | null;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriorityChange: (priority: string | null) => void;
}

const InterventionsContainer: React.FC<InterventionsContainerProps> = ({
  filteredInterventions,
  currentView,
  setCurrentView,
  onClearSearch,
  onViewDetails,
  onStartWork,
  searchQuery,
  selectedPriority,
  onSearchChange,
  onPriorityChange
}) => {
  // Utiliser le hook pour gérer les interactions avec les interventions
  const { 
    updateInterventionStatus, 
    assignTechnician, 
    submitInterventionReport 
  } = useInterventionsData();

  // Utiliser le hook pour récupérer les équipements réels
  const { data: realEquipments = [], isLoading: isLoadingEquipments } = useEquipmentOptions();

  // États pour les dialogs
  const [isNewInterventionOpen, setIsNewInterventionOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  
  // Utiliser notre nouveau hook pour gérer les formulaires
  const { 
    isSubmitting, 
    handleCreateIntervention 
  } = useInterventionFormHandlers({
    onClose: useCallback(() => setIsNewInterventionOpen(false), [])
  });
  
  // Gérer la sélection d'une intervention pour le rapport
  const handleCompleteIntervention = useCallback((intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setIsReportDialogOpen(true);
  }, []);
  
  // Lorsqu'on ouvre le formulaire de création depuis le calendrier
  const handleCreateFromCalendar = useCallback((date?: Date) => {
    // TODO: Pré-remplir le formulaire avec la date sélectionnée
    setIsNewInterventionOpen(true);
  }, []);
  
  // Mémoriser les pièces disponibles pour éviter des recalculs inutiles
  const availableParts = useMemo(() => [
    { id: 1, name: 'Filtre à huile', quantity: 10 },
    { id: 2, name: 'Courroie', quantity: 5 },
    { id: 3, name: 'Filtre à air', quantity: 8 },
    { id: 4, name: 'Bougie d\'allumage', quantity: 12 }
  ], []);
  
  // Handle assigning technician with proper ID type
  const handleAssignTechnician = useCallback((intervention: Intervention, tech: string) => {
    assignTechnician(ensureNumberId(intervention.id), tech);
  }, [assignTechnician]);
  
  // Contenu à afficher selon la vue actuelle
  const renderContent = useCallback(() => {
    switch (currentView) {
      case 'calendar':
        return (
          <CalendarView 
            interventions={filteredInterventions}
            onViewDetails={onViewDetails}
            onCreateIntervention={handleCreateFromCalendar}
          />
        );
      case 'field-tracking':
        return (
          <FieldTrackingView 
            interventions={filteredInterventions}
            onViewDetails={onViewDetails}
            onUpdateStatus={updateInterventionStatus}
            onAssignTechnician={handleAssignTechnician}
          />
        );
      default:
        return (
          <InterventionsList
            filteredInterventions={filteredInterventions}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onClearSearch={onClearSearch}
            onViewDetails={onViewDetails}
            onStartWork={onStartWork}
          />
        );
    }
  }, [
    currentView, 
    filteredInterventions, 
    onViewDetails, 
    handleCreateFromCalendar, 
    updateInterventionStatus, 
    handleAssignTechnician, 
    setCurrentView, 
    onClearSearch, 
    onStartWork
  ]);

  return (
    <div className="container mx-auto py-6">
      {renderContent()}
      
      {/* Dialog de création d'intervention */}
      <NewInterventionDialog
        open={isNewInterventionOpen}
        onOpenChange={setIsNewInterventionOpen}
        onCreate={handleCreateIntervention}
        equipments={realEquipments}
        isLoadingEquipment={isLoadingEquipments}
      />
      
      {/* Dialog de rapport d'intervention */}
      <InterventionReportDialog
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
        intervention={selectedIntervention}
        onSubmit={submitInterventionReport}
        availableParts={availableParts}
      />
    </div>
  );
};

export default React.memo(InterventionsContainer);
