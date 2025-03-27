
import React from 'react';
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

  if (loading) {
    return <EquipmentPartsLoading />;
  }

  if (error) {
    return <EquipmentPartsError error={error} />;
  }

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
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                onCancel={() => setIsEditDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default EquipmentParts;
