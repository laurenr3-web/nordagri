
import { useState } from 'react';
import { Intervention } from '@/types/Intervention';

export interface InterventionsStateProps {
  initialInterventions: Intervention[];
}

export function useInterventionsState({ initialInterventions }: InterventionsStateProps) {
  const [interventions, setInterventions] = useState<Intervention[]>(initialInterventions);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [isNewInterventionDialogOpen, setIsNewInterventionDialogOpen] = useState(false);
  const [interventionDetailsOpen, setInterventionDetailsOpen] = useState(false);
  const [selectedInterventionId, setSelectedInterventionId] = useState<number | string | null>(null);
  const [currentView, setCurrentView] = useState('scheduled');

  // Filter interventions based on search query and priority
  const filteredInterventions = interventions.filter(intervention => {
    const searchMatch = intervention.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.equipment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      intervention.technician.toLowerCase().includes(searchQuery.toLowerCase());

    const priorityMatch = selectedPriority ? intervention.priority === selectedPriority : true;

    return searchMatch && priorityMatch;
  });

  return {
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
  };
}
