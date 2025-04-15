
import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FormHeader } from './form/FormHeader';
import { FormFields } from './form/FormFields';
import { FormActions } from './form/FormActions';
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
    
    if (!validateForm(formData)) {
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
          <FormFields
            formData={formData}
            equipments={equipments}
            interventions={interventions}
            locations={locations}
            loading={loading}
            onChange={handleChange}
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
