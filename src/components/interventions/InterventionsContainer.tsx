
import React, { useState } from 'react';
import InterventionsList from '@/components/interventions/InterventionsList';
import { Intervention, InterventionFormValues } from '@/types/Intervention';
import { useInterventionsData } from '@/hooks/interventions/useInterventionsData';
import { useEquipmentOptions } from '@/hooks/equipment/useEquipmentOptions';
import NewInterventionDialog from './NewInterventionDialog';
import InterventionReportDialog from './dialogs/InterventionReportDialog';
import CalendarView from './views/CalendarView';
import FieldTrackingView from './views/FieldTrackingView';

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
  const {
    data: realEquipments = [],
    isLoading: isLoadingEquipments
  } = useEquipmentOptions();

  // États pour les dialogs
  const [isNewInterventionOpen, setIsNewInterventionOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);

  // Gérer la sélection d'une intervention pour le rapport
  const handleCompleteIntervention = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setIsReportDialogOpen(true);
  };

  // Lorsqu'on ouvre le formulaire de création depuis le calendrier
  const handleCreateFromCalendar = (date?: Date) => {
    // TODO: Pré-remplir le formulaire avec la date sélectionnée
    setIsNewInterventionOpen(true);
  };

  // Contenu à afficher selon la vue actuelle
  const renderContent = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView interventions={filteredInterventions} onViewDetails={onViewDetails} onCreateIntervention={handleCreateFromCalendar} />;
      case 'field-tracking':
        return <FieldTrackingView interventions={filteredInterventions} onViewDetails={onViewDetails} onUpdateStatus={updateInterventionStatus} onAssignTechnician={assignTechnician} />;
      default:
        return (
          <InterventionsList 
            filteredInterventions={filteredInterventions} 
            currentView={currentView} 
            setCurrentView={setCurrentView} 
            onClearSearch={onClearSearch} 
            onViewDetails={onViewDetails} 
            onStartWork={onStartWork}
            searchQuery={searchQuery}
            selectedPriority={selectedPriority}
            onSearchChange={onSearchChange}
            onPriorityChange={onPriorityChange}
          />
        );
    }
  };

  return (
    <div className="container mx-auto py-6 px-[83px]">
      {renderContent()}
      
      {/* Dialog de création d'intervention */}
      <NewInterventionDialog 
        open={isNewInterventionOpen} 
        onOpenChange={setIsNewInterventionOpen} 
        onCreate={async values => {
          console.log('Creating intervention:', values);
          setIsNewInterventionOpen(false);
          // Return a resolved promise to satisfy the type
          return Promise.resolve();
        }} 
        equipments={realEquipments} 
        isLoadingEquipment={isLoadingEquipments} 
      />
      
      {/* Dialog de rapport d'intervention */}
      <InterventionReportDialog 
        open={isReportDialogOpen} 
        onOpenChange={setIsReportDialogOpen} 
        intervention={selectedIntervention} 
        onSubmit={submitInterventionReport} 
        availableParts={[
          {
            id: 1,
            name: 'Filtre à huile',
            quantity: 10
          }, 
          {
            id: 2,
            name: 'Courroie',
            quantity: 5
          }, 
          {
            id: 3,
            name: 'Filtre à air',
            quantity: 8
          }, 
          {
            id: 4,
            name: 'Bougie d\'allumage',
            quantity: 12
          }
        ]} 
      />
    </div>
  );
};

export default InterventionsContainer;
