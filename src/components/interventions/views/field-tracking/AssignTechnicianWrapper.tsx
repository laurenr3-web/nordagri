
import React, { useState } from 'react';
import { Intervention } from '@/types/Intervention';
import AssignTechnicianDialog from '../../dialogs/AssignTechnicianDialog';

interface AssignTechnicianWrapperProps {
  onAssignTechnician?: (intervention: Intervention, technician: string) => void;
  children: (handleAssignTechnician: (intervention: Intervention) => void) => React.ReactNode;
}

const AssignTechnicianWrapper: React.FC<AssignTechnicianWrapperProps> = ({
  onAssignTechnician,
  children
}) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  
  // Gérer l'assignation d'un technicien
  const handleAssignTechnician = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setAssignDialogOpen(true);
  };
  
  // Soumettre l'assignation
  const handleAssignSubmit = (technician: string) => {
    if (selectedIntervention && onAssignTechnician) {
      onAssignTechnician(selectedIntervention, technician);
      setAssignDialogOpen(false);
      setSelectedIntervention(null);
    }
  };
  
  return (
    <>
      {children(handleAssignTechnician)}
      
      <AssignTechnicianDialog 
        open={assignDialogOpen} 
        onOpenChange={setAssignDialogOpen}
        onSubmit={handleAssignSubmit}
        intervention={selectedIntervention}
      />
    </>
  );
};

export default AssignTechnicianWrapper;
