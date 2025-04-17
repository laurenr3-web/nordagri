
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import EquipmentDetails from '@/components/equipment/EquipmentDetails';
import { EquipmentItem } from '../hooks/useEquipmentFilters';
import { ScrollArea } from '@/components/ui/scroll-area';

// Type amélioré pour la création d'équipement avec les propriétés UI requises
interface EquipmentItemWithUIProps extends EquipmentItem {
  lastMaintenance: string;
  usage: { hours: number; target: number };
  nextService: { type: string; due: string };
}

const EquipmentDialogs: React.FC = () => {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItemWithUIProps | null>(null);
  
  useEffect(() => {
    // Listen for custom events to open the dialogs
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

    window.addEventListener('equipment-selected', 
      handleEquipmentSelected as EventListener);

    return () => {
      window.removeEventListener('equipment-selected', 
        handleEquipmentSelected as EventListener);
    };
  }, []);

  return (
    <>
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
