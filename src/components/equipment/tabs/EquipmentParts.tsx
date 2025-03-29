
import React, { useState } from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EditPartForm from '@/components/parts/dialogs/form/EditPartForm';
import EquipmentPartsLoading from './parts/EquipmentPartsLoading';
import EquipmentPartsError from './parts/EquipmentPartsError';
import EquipmentPartsHeader from './parts/EquipmentPartsHeader';
import EquipmentPartsTable from './parts/EquipmentPartsTable';
import { useEquipmentParts } from '@/hooks/equipment/useEquipmentParts';

interface EquipmentPartsProps {
  equipment: Equipment;
}

const EquipmentParts: React.FC<EquipmentPartsProps> = ({ equipment }) => {
  const {
    parts,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedPart,
    isEditDialogOpen,
    setIsEditDialogOpen,
    handleEditPart,
    handlePartUpdated,
    handleAddPart,
    isUpdating
  } = useEquipmentParts(equipment);

  // Add a local state to track when dialog is closing
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  if (loading) {
    return <EquipmentPartsLoading />;
  }

  if (error) {
    return <EquipmentPartsError error={error} />;
  }
  
  // Safe dialog state handler to prevent unmounting issues
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // First, mark as closing to trigger animation
      setIsDialogClosing(true);
      
      // Then actually close after animation completes
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setIsDialogClosing(false);
      }, 200);
    } else {
      setIsEditDialogOpen(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <EquipmentPartsHeader 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddPart={handleAddPart}
        />
      </CardHeader>
      <CardContent>
        <EquipmentPartsTable 
          parts={parts}
          onEditPart={handleEditPart}
        />

        {/* Dialog pour modifier une pièce */}
        <Dialog 
          open={isEditDialogOpen && !isDialogClosing} 
          onOpenChange={handleDialogOpenChange}
        >
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isUpdating ? 'Mise à jour en cours...' : 'Modifier la pièce'}
              </DialogTitle>
            </DialogHeader>
            {selectedPart && (
              <EditPartForm 
                part={selectedPart} 
                onSubmit={handlePartUpdated}
                onCancel={() => handleDialogOpenChange(false)}
                onMainDialogClose={() => handleDialogOpenChange(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
