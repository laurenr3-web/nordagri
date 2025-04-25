
import React from 'react';
import { Equipment } from '@/services/supabase/equipmentService';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEquipmentParts } from '@/hooks/equipment/useEquipmentParts';
import EditPartForm from '@/components/parts/dialogs/form/EditPartForm';
import EquipmentPartsLoading from './parts/EquipmentPartsLoading';
import EquipmentPartsError from './parts/EquipmentPartsError';
import EquipmentPartsHeader from './parts/EquipmentPartsHeader';
import EquipmentPartsTable from './parts/EquipmentPartsTable';
import EquipmentPartsLowStockWarning from './parts/EquipmentPartsLowStockWarning';
import EquipmentPartsAssociation from './parts/EquipmentPartsAssociation';
import AddPartDialog from '@/components/parts/dialogs/AddPartDialog';
import EquipmentPartsCompatible from './parts/EquipmentPartsCompatible';

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
    isAddPartDialogOpen,
    setIsAddPartDialogOpen,
    handleEditPart,
    handlePartUpdated,
    handleAddPart,
    handleDeletePart,
    isUpdating
  } = useEquipmentParts(equipment);

  if (loading) {
    return <EquipmentPartsLoading />;
  }

  if (error) {
    return <EquipmentPartsError error={error} />;
  }

  return (
    <div className="space-y-6">
      {/* Section des pièces compatibles */}
      <EquipmentPartsCompatible equipmentId={equipment.id} />
      
      <Card>
        <CardHeader>
          <EquipmentPartsHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPart={handleAddPart}
          />
        </CardHeader>
        <CardContent>
          {/* Section d'association */}
          <EquipmentPartsAssociation 
            equipment={equipment}
            onAddPart={handleAddPart}
          />

          {/* Afficher l'alerte de stock bas si nécessaire */}
          <EquipmentPartsLowStockWarning parts={parts} />
          
          <EquipmentPartsTable 
            parts={parts}
            onEditPart={handleEditPart}
            onDeletePart={handleDeletePart}
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

          {/* Dialog pour ajouter une pièce */}
          <AddPartDialog
            isOpen={isAddPartDialogOpen}
            onOpenChange={setIsAddPartDialogOpen}
            onSuccess={(newPart) => {
              console.log("Nouvelle pièce ajoutée:", newPart);
              // Rafraîchir la liste des pièces
              window.location.reload();
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default EquipmentParts;
