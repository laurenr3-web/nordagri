
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
      console.log("PartManagementDialogs: Édition de la pièce", part?.name);
      const localPart = convertToLocalPart(part);
      handleEditPart(localPart);
    }
  };

  // Wrapper function for deleting parts
  const handleDeletePartWrapper = (partId: number | string) => {
    if (handleDeletePart) {
      console.log("PartManagementDialogs: Suppression de la pièce", partId);
      handleDeletePart(partId);
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
        onEdit={handleEditPart ? handleEditPartWrapper : undefined}
        onDelete={handleDeletePart ? handleDeletePartWrapper : undefined}
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
