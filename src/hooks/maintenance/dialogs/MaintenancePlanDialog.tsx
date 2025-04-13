
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MaintenancePlanForm from '../forms/MaintenancePlanForm';
import { useMaintenancePlanner } from '../useMaintenancePlanner';
import { useEquipmentOptions } from '../useEquipmentOptions';
import { MaintenancePlan } from '../types/maintenancePlanTypes';

interface MaintenancePlanDialogProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentId?: number;
  equipmentName?: string;
}

const MaintenancePlanDialog: React.FC<MaintenancePlanDialogProps> = ({
  isOpen,
  onClose,
  equipmentId,
  equipmentName
}) => {
  const { createMaintenancePlan } = useMaintenancePlanner();
  const { data: equipments = [], isLoading: isLoadingEquipment } = useEquipmentOptions();

  const handleSubmit = async (data: any) => {
    try {
      // Find the equipment id if only the name was provided
      let selectedEquipmentId = equipmentId;
      let selectedEquipmentName = equipmentName || data.equipment;
      
      if (!selectedEquipmentId) {
        const selectedEquipment = equipments.find(eq => eq.name === data.equipment);
        if (selectedEquipment) {
          selectedEquipmentId = selectedEquipment.id;
        }
      }
      
      if (!selectedEquipmentName) {
        const selectedEquipment = equipments.find(eq => eq.id === selectedEquipmentId);
        if (selectedEquipment) {
          selectedEquipmentName = selectedEquipment.name;
        }
      }
      
      const plan: Omit<MaintenancePlan, 'id'> = {
        title: data.title,
        description: data.description,
        equipmentId: selectedEquipmentId!,
        equipmentName: selectedEquipmentName,
        frequency: data.frequency,
        interval: data.interval,
        unit: data.unit,
        nextDueDate: data.nextDueDate,
        lastPerformedDate: null,
        type: data.type,
        engineHours: data.engineHours,
        priority: data.priority,
        active: true,
        assignedTo: data.assignedTo
      };
      
      await createMaintenancePlan(plan);
      onClose();
    } catch (error) {
      console.error('Error creating maintenance plan:', error);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create Maintenance Plan</DialogTitle>
      </DialogHeader>
      
      <MaintenancePlanForm
        onSubmit={handleSubmit}
        onCancel={onClose}
        equipmentOptions={equipments}
        isLoadingEquipment={isLoadingEquipment}
        defaultValues={
          equipmentId && equipmentName 
            ? { equipment: equipmentName } 
            : undefined
        }
      />
    </DialogContent>
  );
};

export default MaintenancePlanDialog;
