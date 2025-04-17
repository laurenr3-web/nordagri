
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import { useAddEquipment } from '@/hooks/equipment/useAddEquipment';
import { toast } from 'sonner';
import { EquipmentFormValues } from '@/components/equipment/form/equipmentFormTypes';

// Type amélioré pour la création d'équipement avec les propriétés UI requises
interface EquipmentItemWithUIProps extends EquipmentItem {
  lastMaintenance: string;
  usage: { hours: number; target: number };
  nextService: { type: string; due: string };
}

const EquipmentDialogs: React.FC = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItemWithUIProps | null>(null);
  const { mutate, isPending } = useAddEquipment();
  
  useEffect(() => {
    // Listen for custom events to open the dialogs
    const handleOpenAddDialog = () => {
      console.log('Opening add equipment dialog');
      setIsAddDialogOpen(true);
    };

    const handleEquipmentSelected = (event: CustomEvent<EquipmentItem>) => {
      // S'assurer que l'équipement a toutes les propriétés UI requises
      const equipmentWithUIProps: EquipmentItemWithUIProps = {
        ...event.detail,
        lastMaintenance: event.detail.lastMaintenance || 'N/A',
        usage: event.detail.usage || { hours: 0, target: 500 },
        nextService: event.detail.nextService || { type: 'Regular maintenance', due: 'In 30 days' }
      };
      setSelectedEquipment(equipmentWithUIProps);
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
    console.log('Form data received:', data);
    
    try {
      // Create new equipment object from form data
      const newEquipment = {
        name: data.name,
        type: data.type,
        manufacturer: data.manufacturer,
        model: data.model || '',
        year: data.year ? parseInt(data.year) : null,
        status: data.status,
        location: data.location || '',
        serialNumber: data.serialNumber || null,
        purchaseDate: data.purchaseDate,
        notes: data.notes || '',
        image: data.image || '',
        unite_d_usure: data.unite_d_usure || 'heures',
        valeur_actuelle: data.valeur_actuelle || 0,
      };
      
      console.log('Adding new equipment:', newEquipment);
      
      mutate(newEquipment, {
        onSuccess: () => {
          console.log('Equipment added successfully');
          setIsAddDialogOpen(false);
          toast.success("Équipement ajouté avec succès");
        },
        onError: (error: any) => {
          console.error("Erreur lors de l'ajout de l'équipement:", error);
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
        <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Ajouter un équipement</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[calc(95vh-120px)] overflow-y-auto pr-4">
            <div className="pb-6">
              <EquipmentForm 
                onSubmit={handleAddEquipment}
                onCancel={() => setIsAddDialogOpen(false)}
                isSubmitting={isPending}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog open={!!selectedEquipment} onOpenChange={(open) => !open && setSelectedEquipment(null)}>
        <DialogContent className="max-w-3xl max-h-[95vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 max-h-[calc(95vh-120px)] overflow-y-auto pr-4">
            <div className="pb-6">
              {selectedEquipment && <EquipmentDetails equipment={selectedEquipment} />}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentDialogs;
