
import React, { useState, useCallback, useEffect, memo } from 'react';
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

// Utiliser memo pour éviter les re-rendus inutiles
const EquipmentParts: React.FC<EquipmentPartsProps> = memo(({ equipment }) => {
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

  // Ajouter un état local pour suivre la fermeture du dialogue
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      // Nettoyer les ressources si nécessaire
    };
  }, []);

  if (loading) {
    return <EquipmentPartsLoading />;
  }

  if (error) {
    return <EquipmentPartsError error={error} />;
  }
  
  // Gestionnaire d'état de dialogue optimisé avec useCallback
  const handleDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      // D'abord marquer comme fermant pour déclencher l'animation
      setIsDialogClosing(true);
      
      // Puis définir l'état réel après la fin de l'animation
      requestAnimationFrame(() => {
        setTimeout(() => {
          setIsEditDialogOpen(false);
          setIsDialogClosing(false);
        }, 300);
      });
    } else {
      setIsEditDialogOpen(true);
      setIsDialogClosing(false);
    }
  }, [setIsEditDialogOpen]);

  // Traitement optimisé pour la mise à jour des pièces
  const handlePartUpdatedOptimized = useCallback((updatedPart) => {
    handlePartUpdated(updatedPart);
    // Fermer le dialogue de manière optimisée
    setTimeout(() => handleDialogOpenChange(false), 100);
  }, [handlePartUpdated, handleDialogOpenChange]);

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

        {/* Dialogue pour modifier une pièce - implémentation plus performante */}
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
                onSubmit={handlePartUpdatedOptimized}
                onCancel={() => handleDialogOpenChange(false)}
                onMainDialogClose={() => handleDialogOpenChange(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
});

EquipmentParts.displayName = 'EquipmentParts';

export default EquipmentParts;
