
import { useState } from 'react';
import { MaintenanceFormValues } from '@/hooks/maintenance/maintenanceSlice';
import { useFormFields } from './useFormFields';
import { useStaffManagement } from './useStaffManagement';
import { useEquipmentOptions } from './useEquipmentOptions';
import { toast } from 'sonner';

export const useMaintenanceForm = (
  onSubmit: (formValues: MaintenanceFormValues) => void, 
  onClose: (open: boolean) => void,
  initialDate?: Date
) => {
  // Use the extracted hooks
  const formFields = useFormFields(initialDate);
  const staffManagement = useStaffManagement();
  const equipmentData = useEquipmentOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier qu'au moins une date d'échéance ou un seuil est défini
    const hasDueDate = formFields.dueDate !== null;
    const hasTriggerThreshold = 
      (formFields.trigger_unit === 'hours' && formFields.trigger_hours > 0) ||
      (formFields.trigger_unit === 'kilometers' && formFields.trigger_kilometers > 0);
    
    if (!hasDueDate && !hasTriggerThreshold) {
      toast({
        description: "Veuillez définir une date d'échéance ou un seuil d'usure.",
        variant: "destructive",
      });
      return;
    }

    const formData: MaintenanceFormValues = {
      title: formFields.title,
      equipment: equipmentData.equipment,
      equipmentId: equipmentData.equipmentId,
      type: formFields.type,
      priority: formFields.priority,
      dueDate: formFields.dueDate,
      engineHours: parseFloat(formFields.engineHours),
      assignedTo: staffManagement.assignedTo,
      notes: formFields.notes,
      trigger_unit: formFields.trigger_unit,
      trigger_hours: formFields.trigger_unit === 'hours' ? formFields.trigger_hours : undefined,
      trigger_kilometers: formFields.trigger_unit === 'kilometers' ? formFields.trigger_kilometers : undefined,
    };
    
    onSubmit(formData);
    onClose(false);
    
    // Reset form
    formFields.resetForm();
    equipmentData.setEquipment('');
    staffManagement.setAssignedTo('');
  };

  return {
    // Form values from useFormFields
    ...formFields,
    
    // Equipment data from useEquipmentOptions
    equipment: equipmentData.equipment,
    setEquipment: equipmentData.setEquipment,
    equipmentId: equipmentData.equipmentId,
    equipmentOptions: equipmentData.equipmentOptions,
    handleEquipmentChange: equipmentData.handleEquipmentChange,
    isLoading: equipmentData.isLoading,
    
    // Staff management from useStaffManagement
    assignedTo: staffManagement.assignedTo,
    setAssignedTo: staffManagement.setAssignedTo,
    isAddStaffDialogOpen: staffManagement.isAddStaffDialogOpen,
    setIsAddStaffDialogOpen: staffManagement.setIsAddStaffDialogOpen,
    newStaffName: staffManagement.newStaffName,
    setNewStaffName: staffManagement.setNewStaffName,
    staffOptions: staffManagement.staffOptions,
    handleAddStaff: staffManagement.handleAddStaff,
    isLoadingStaff: staffManagement.isLoadingStaff,
    
    // Form submission
    handleSubmit,
  };
};
