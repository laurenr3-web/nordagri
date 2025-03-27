
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useAddEquipment } from '@/hooks/equipment/useAddEquipment';
import { EquipmentFormValues } from '../form/equipmentFormTypes';
import { toast } from 'sonner';

const EquipmentDialogs: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null);
  const { mutate, isPending } = useAddEquipment();

  useEffect(() => {
    // Listen for custom events to open the dialogs
    const handleOpenAddDialog = () => {
      setIsAddDialogOpen(true);
    };

    const handleEquipmentSelected = (event: CustomEvent<EquipmentItem>) => {
      setSelectedEquipment(event.detail);
    };

    window.addEventListener('open-add-equipment-dialog', handleOpenAddDialog);
    window.addEventListener('equipment-selected', 
      handleEquipmentSelected as EventListener);

    return () => {
      window.removeEventListener('open-add-equipment-dialog', handleOpenAddDialog);
      window.removeEventListener('equipment-selected', 
        handleEquipmentSelected as EventListener);
    };
  }, []);

  const handleAddEquipment = (data: EquipmentFormValues) => {
    // Log form data for debugging
    console.log('Form data received:', data);
    
    try {
      // Create new equipment object from form data
      const newEquipment = {
        name: data.name,
        type: data.type,
        category: data.category.charAt(0).toUpperCase() + data.category.slice(1),
        manufacturer: data.manufacturer,
        model: data.model || '',
        year: data.year ? parseInt(data.year) : null,
        status: data.status,
        location: data.location || '',
        serialNumber: data.serialNumber || null,  // Handle null case explicitly
        purchaseDate: data.purchaseDate,
        notes: data.notes || '',
        image: data.image || '',
      };
      
      console.log('Adding new equipment:', newEquipment);
      
      // Add equipment using the hook's mutate function
      mutate(newEquipment, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          toast.success("Équipement ajouté avec succès");
        },
        onError: (error: any) => {
          console.error("Erreur lors de l'ajout de l'équipement:", error);
          // Add detailed error logging
          if (error.code) {
            console.error("Code d'erreur:", error.code);
          }
          if (error.details) {
            console.error("Détails de l'erreur:", error.details);
          }
          if (error.hint) {
            console.error("Suggestion:", error.hint);
          }
          
          toast.error("Erreur lors de l'ajout de l'équipement", { 
            description: error.message || "Une erreur s'est produite" 
          });
        }
      });
    } catch (error: any) {
      console.error("Exception lors de l'ajout de l'équipement:", error);
      toast.error("Erreur lors de l'ajout de l'équipement", { 
        description: error.message || "Une erreur s'est produite"
      });
    }
  };

  return (
    <>
      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ajouter un équipement</DialogTitle>
          </DialogHeader>
          <EquipmentForm 
            onSubmit={handleAddEquipment}
            onCancel={() => setIsAddDialogOpen(false)}
            isSubmitting={isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog 
        open={!!selectedEquipment} 
        onOpenChange={(open) => !open && setSelectedEquipment(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails de l'équipement</DialogTitle>
          </DialogHeader>
          {selectedEquipment && <EquipmentDetails equipment={selectedEquipment} />}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentDialogs;
