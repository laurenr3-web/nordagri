
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
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Bug } from 'lucide-react';

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
    isUpdating,
    isUsingDemoData,
    debugPartData
  } = useEquipmentParts(equipment);

  if (loading) {
    return <EquipmentPartsLoading />;
  }

  if (error) {
    return <EquipmentPartsError error={error} />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex-1">
          <EquipmentPartsHeader 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddPart={handleAddPart}
          />
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={debugPartData}
          className="ml-2"
        >
          <Bug className="h-4 w-4 mr-1" />
          Déboguer
        </Button>
      </CardHeader>
      <CardContent>
        {/* Indicateur de données de démonstration */}
        {isUsingDemoData && (
          <Alert variant="warning" className="mb-4">
            <InfoCircledIcon className="h-4 w-4" />
            <AlertTitle>Données de démonstration</AlertTitle>
            <AlertDescription>
              Vous visualisez actuellement des données de démonstration, pas des données réelles de la base de données.
            </AlertDescription>
          </Alert>
        )}
        
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
  );
};

export default EquipmentParts;
