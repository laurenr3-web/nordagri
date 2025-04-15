
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { TaskTypeField } from './form/TaskTypeField';
import { EquipmentField } from './form/EquipmentField';
import { InterventionField } from './form/InterventionField';
import { LocationField } from './form/LocationField';
import { FormHeader } from './form/FormHeader';
import { FormActions } from './form/FormActions';
import { NotesField } from './form/NotesField';
import { useTimeEntryForm } from '@/hooks/time-tracking/useTimeEntryForm';
import { toast } from 'sonner';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const {
    formData,
    equipments,
    interventions,
    locations,
    loading,
    formError,
    handleChange,
    validateForm,
    fetchEquipments,
    fetchLocations
  } = useTimeEntryForm();

  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
      fetchLocations();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error(formError || "Please fill in all required fields");
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <FormHeader />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TaskTypeField
            taskType={formData.task_type}
            customTaskType={formData.custom_task_type}
            onChange={handleChange}
          />
          
          <EquipmentField
            equipment_id={formData.equipment_id}
            equipments={equipments}
            loading={loading}
            onChange={handleChange}
          />
          
          {formData.equipment_id && (
            <InterventionField
              intervention_id={formData.intervention_id}
              interventions={interventions}
              disabled={!formData.equipment_id}
              onChange={handleChange}
            />
          )}
          
          <LocationField
            location_id={formData.location_id}
            locations={locations}
            disabled={loading}
            onChange={handleChange}
          />
          
          <NotesField 
            value={formData.notes}
            onChange={(value) => handleChange('notes', value)}
          />

          <FormActions 
            onCancel={() => onOpenChange(false)}
            loading={loading}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
