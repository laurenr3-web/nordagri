
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTimeEntryForm } from '@/hooks/time-tracking/useTimeEntryForm';
import { EquipmentField } from './form/EquipmentField';
import { InterventionField } from './form/InterventionField';
import { LocationField } from './form/LocationField';
import { TaskTypeField } from './form/TaskTypeField';
import { useMediaQuery } from '@/hooks/useMediaQuery';

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
    locations,
    loading,
    formError,
    handleChange,
    validateForm,
    fetchEquipments,
    fetchLocations
  } = useTimeEntryForm();
  
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
      fetchLocations();
    }
  }, [isOpen]);
  
  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const content = (
    <div className="grid gap-4 py-4">
      {formError && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {formError}
        </div>
      )}
      
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
      
      <LocationField
        location_id={formData.location_id}
        locations={locations}
        disabled={false}
        onChange={handleChange}
      />
      
      <InterventionField
        intervention_id={formData.intervention_id}
        interventions={interventions}
        disabled={!formData.equipment_id}
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
  );
  
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Start Session</SheetTitle>
          </SheetHeader>
          
          {content}
          
          <SheetFooter className="pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              Démarrer la session
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start Session</DialogTitle>
        </DialogHeader>
        
        {content}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
            Démarrer la session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
