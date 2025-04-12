
import { useState } from 'react';
import { MaintenanceFormValues, MaintenanceStatus } from '@/hooks/maintenance/maintenanceSlice';
import { useFormFields } from './useFormFields';
import { useStaffManagement } from './useStaffManagement';
import { useEquipmentOptions } from './useEquipmentOptions';

export const useMaintenanceForm = (
  onSubmit: (values: MaintenanceFormValues) => void, 
  onClose: (open: boolean) => void,
  initialDate?: Date
) => {
  // Use the extracted hooks
  const formFields = useFormFields(initialDate);
  const staffManagement = useStaffManagement();
  const equipmentData = useEquipmentOptions();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: MaintenanceFormValues = {
      title: formFields.title,
      equipment: equipmentData.equipment,
      equipmentId: equipmentData.equipmentId,
      type: formFields.type,
      priority: formFields.priority,
      status: 'scheduled' as MaintenanceStatus, // Add the status property with default value 'scheduled'
      dueDate: formFields.dueDate,
      engineHours: parseFloat(formFields.engineHours),
      assignedTo: staffManagement.assignedTo,
      notes: formFields.notes,
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
