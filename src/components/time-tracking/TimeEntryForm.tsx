
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTimeEntryForm } from '@/hooks/time-tracking/useTimeEntryForm';
import { EquipmentField } from './form/EquipmentField';
import { InterventionField } from './form/InterventionField';
import { TaskTypeField } from './form/TaskTypeField';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => void;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const {
    formData,
    equipments,
    interventions,
    loading,
    formError,
    handleChange,
    validateForm,
    fetchEquipments
  } = useTimeEntryForm();
  
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    }
  }, [isOpen]);
  
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Time Tracking Session</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {formError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <EquipmentField
            equipment_id={formData.equipment_id}
            equipments={equipments}
            loading={loading}
            onChange={handleChange}
          />
          
          <InterventionField
            intervention_id={formData.intervention_id}
            interventions={interventions}
            disabled={!formData.equipment_id}
            onChange={handleChange}
          />
          
          <TaskTypeField
            taskType={formData.task_type}
            customTaskType={formData.custom_task_type}
            onChange={handleChange}
          />
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add details about the task..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Start Tracking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

