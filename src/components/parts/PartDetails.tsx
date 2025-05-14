
import React, { useState, useEffect } from 'react';
import { Part } from '@/types/Part';
import { useNavigate } from 'react-router-dom';
import { useDeletePart } from '@/hooks/parts';
import { usePartsWithdrawal } from '@/hooks/parts/usePartsWithdrawal';
import { toast } from 'sonner';

import PartImage from './details/PartImage';
import PartDetailsHeader from './details/PartDetailsHeader';
import DeleteConfirmationDialog from './details/DeleteConfirmationDialog';
import EditPartDialog from './dialogs/EditPartDialog';
import { WithdrawalDialog } from '@/components/parts/dialogs/withdrawal';
import DetailsTabs from './details/DetailsTabs';

interface PartDetailsProps {
  part: Part;
  onEdit?: (part: Part) => void;
  onDelete?: (partId: number | string) => void;
  onDialogClose?: () => void;
  onBack?: () => void;
}

const PartDetails: React.FC<PartDetailsProps> = ({ part, onEdit, onDelete, onDialogClose, onBack }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const deleteMutation = useDeletePart();
  const navigate = useNavigate();
  const { openWithdrawalDialog, isWithdrawalDialogOpen, selectedPart, setIsWithdrawalDialogOpen } = usePartsWithdrawal();

  // Ensure part data is valid
  if (!part) {
    console.error('PartDetails rendered without a valid part object');
    return (
      <div className="p-4 text-center text-muted-foreground">
        Données de pièce non disponibles. Veuillez réessayer.
      </div>
    );
  }

  // When the component mounts or part changes, verify the part ID
  useEffect(() => {
    if (part) {
      const partId = typeof part.id === 'string' ? parseInt(part.id, 10) : part.id;
      if (isNaN(partId)) {
        console.error('Invalid part ID in PartDetails:', part.id);
        toast.error('ID de pièce invalide');
      } else {
        console.log('PartDetails loaded with valid part ID:', partId);
      }
    }
  }, [part]);

  const handleDelete = async () => {
    try {
      if (onDelete) {
        await onDelete(part.id);
      } else {
        // Use mutation for deletion if no handler is provided
        await deleteMutation.mutateAsync(part.id);
      }
      
      // Close dialogs after successful deletion
      if (onDialogClose) {
        onDialogClose();
      }
      
      // Navigate to parts page after successful deletion
      navigate('/parts');
    } catch (error) {
      console.error('Error deleting part:', error);
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const handleEdit = (updatedPart: Part) => {
    if (onEdit) {
      onEdit(updatedPart);
    }
    
    // First close the edit dialog
    setIsEditDialogOpen(false);
    
    // Then close the main dialog after the update is confirmed
    if (onDialogClose) {
      setTimeout(() => onDialogClose(), 300);
    }
  };

  const handleTabChange = (value: string) => {
    console.log('Changing tab to:', value);
    setActiveTab(value);
  };

  const openEditDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  // Handler to open the delete confirmation dialog
  const openDeleteDialog = (e: React.MouseEvent) => {
    // Prevent event from bubbling up which might cause redirection
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  // Handler pour ouvrir la dialogue de retrait
  const handleWithdrawal = (e: React.MouseEvent) => {
    e.stopPropagation();
    openWithdrawalDialog(part);
  };

  return (
    <div className="space-y-6">
      <PartDetailsHeader 
        part={part}
        onBack={onBack}
        onEdit={openEditDialog}
        onDelete={openDeleteDialog}
        onWithdrawal={handleWithdrawal}
      />

      <PartImage part={part} />

      <DetailsTabs 
        part={part} 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      {/* Edit Part Dialog */}
      {isEditDialogOpen && (
        <EditPartDialog 
          isOpen={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          part={part}
          onSubmit={handleEdit}
          onMainDialogClose={onDialogClose}
        />
      )}

      {/* Withdrawal Dialog */}
      <WithdrawalDialog 
        isOpen={isWithdrawalDialogOpen && selectedPart?.id === part.id} 
        onOpenChange={setIsWithdrawalDialogOpen}
        part={selectedPart}
      />
    </div>
  );
};

export default PartDetails;
