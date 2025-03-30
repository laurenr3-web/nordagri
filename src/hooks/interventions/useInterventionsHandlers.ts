
import { Intervention } from '@/types/Intervention';
import { toast } from '@/hooks/use-toast';

export interface InterventionsHandlersProps {
  interventions: Intervention[];
  setInterventions: React.Dispatch<React.SetStateAction<Intervention[]>>;
  setIsNewInterventionDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setInterventionDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedInterventionId: React.Dispatch<React.SetStateAction<number | string | null>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSelectedPriority: React.Dispatch<React.SetStateAction<string | null>>;
}

export function useInterventionsHandlers({
  interventions,
  setInterventions,
  setIsNewInterventionDialogOpen,
  setInterventionDetailsOpen,
  setSelectedInterventionId,
  setSearchQuery,
  setSelectedPriority
}: InterventionsHandlersProps) {
  
  const handleOpenNewInterventionDialog = () => {
    setIsNewInterventionDialogOpen(true);
  };

  const handleCloseNewInterventionDialog = () => {
    setIsNewInterventionDialogOpen(false);
  };

  const handleCreateIntervention = (newIntervention: Partial<Intervention>) => {
    // Create a new intervention with required fields and empty partsUsed array
    const completedIntervention: Intervention = {
      ...newIntervention as any,
      id: interventions.length + 1,
      partsUsed: [],  // Ensure partsUsed is included
      status: 'scheduled',
    } as Intervention;
    
    setInterventions([...interventions, completedIntervention]);
    setIsNewInterventionDialogOpen(false);
    toast({
      title: "Succès",
      description: "Nouvelle intervention créée avec succès.",
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePriorityChange = (priority: string | null) => {
    setSelectedPriority(priority);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedPriority(null);
  };

  const handleViewDetails = (intervention: Intervention) => {
    setSelectedInterventionId(intervention.id);
    setInterventionDetailsOpen(true);
  };

  const handleCloseInterventionDetails = () => {
    setInterventionDetailsOpen(false);
    setSelectedInterventionId(null);
  };

  const handleStartWork = (intervention: Intervention) => {
    // Placeholder for start work logic
    toast({
      title: "Intervention démarrée",
      description: `L'intervention ${intervention.title} a été marquée comme démarrée.`,
    });
  };

  return {
    handleOpenNewInterventionDialog,
    handleCloseNewInterventionDialog,
    handleCreateIntervention,
    handleSearchChange,
    handlePriorityChange,
    handleClearSearch,
    handleViewDetails,
    handleCloseInterventionDetails,
    handleStartWork
  };
}
