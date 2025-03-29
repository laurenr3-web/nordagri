
import React from 'react';
import PartDetailsDialog from '@/components/parts/dialogs/PartDetailsDialog';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import { Part } from '@/types/Part';
import { LocalPart, convertToLocalPart, convertToPart } from '@/utils/partTypeConverters';

interface PartManagementDialogsProps {
  selectedPart: LocalPart | null;
  isPartDetailsDialogOpen: boolean;
  isAddPartDialogOpen: boolean;
  setIsPartDetailsDialogOpen: (open: boolean) => void;
  setIsAddPartDialogOpen: (open: boolean) => void;
  handleEditPart?: (part: LocalPart) => void;
  handleDeletePart?: (partId: number | string) => void;
  handleAddPart?: (data: any) => void;
}

const PartManagementDialogs: React.FC<PartManagementDialogsProps> = ({
  selectedPart,
  isPartDetailsDialogOpen,
  isAddPartDialogOpen,
  setIsPartDetailsDialogOpen,
  setIsAddPartDialogOpen,
  handleEditPart,
  handleDeletePart,
  handleAddPart
}) => {
  // Debug log pour vérifier les valeurs
  console.log("PartManagementDialogs - Props:", { 
    selectedPart: selectedPart?.name, 
    isPartDetailsDialogOpen, 
    isAddPartDialogOpen 
  });

  // Wrapper function for editing parts
  const handleEditPartWrapper = (part: any) => {
    if (handleEditPart) {
      const localPart = convertToLocalPart(part);
      handleEditPart(localPart);
    }
  };

  // Convert selectedPart to the expected Part type with null check
  const convertedSelectedPart = selectedPart ? (convertToPart(selectedPart) as any) : null;

  return (
    <>
      <PartDetailsDialog
        isOpen={isPartDetailsDialogOpen}
        onOpenChange={setIsPartDetailsDialogOpen}
        selectedPart={convertedSelectedPart}
        onEdit={handleEditPartWrapper}
        onDelete={handleDeletePart}
      />
      
      <AddPartDialog
        isOpen={isAddPartDialogOpen}
        onOpenChange={setIsAddPartDialogOpen}
        onSuccess={handleAddPart}
      />
    </>
  );
};

export default PartManagementDialogs;
