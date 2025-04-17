
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { useAddEquipment } from '@/hooks/equipment/useAddEquipment';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  const handleAddEquipment = (data: any) => {
    // Create new equipment object from form data
    const newEquipment = {
      name: data.name,
      type: data.type,
      category: data.category,
      manufacturer: data.manufacturer,
      model: data.model,
      year: parseInt(data.year),
      status: data.status,
      location: data.location,
      serialNumber: data.serialNumber,
      purchaseDate: data.purchaseDate,
      notes: data.notes,
      image: data.image,
    };
    
    console.log('Adding new equipment:', newEquipment);
    
    // Add equipment using the hook's mutate function
    mutate(newEquipment, {
      onSuccess: () => {
        setIsAddDialogOpen(false);
      }
    });
  };

  return (
    <>
      {/* Add Equipment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Equipment</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] overflow-auto pr-4">
            <EquipmentForm 
              onSubmit={handleAddEquipment}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={isPending}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Equipment Details Dialog */}
      <Dialog open={!!selectedEquipment} onOpenChange={(open) => !open && setSelectedEquipment(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Equipment Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] overflow-auto pr-4">
            {selectedEquipment && <EquipmentDetails equipment={selectedEquipment} />}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentDialogs;
