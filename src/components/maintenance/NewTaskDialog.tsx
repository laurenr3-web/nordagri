
import React from 'react';
import { MaintenanceFormValues } from '@/hooks/maintenance/maintenanceSlice';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useMaintenanceForm } from '@/hooks/maintenance/useMaintenanceForm';
import TaskFormFields from './TaskFormFields';
import AddStaffDialog from './dialogs/AddStaffDialog';

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: MaintenanceFormValues) => void;
  initialDate?: Date;
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({ open, onOpenChange, onSubmit, initialDate }) => {
  const {
    // Form values
    title,
    setTitle,
    equipment,
    setEquipment,
    type,
    setType,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    estimatedDuration,
    setEstimatedDuration,
    assignedTo,
    setAssignedTo,
    notes,
    setNotes,
    
    // Staff management
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    newStaffName,
    setNewStaffName,
    staffOptions,
    handleAddStaff,
    
    // Equipment options
    equipmentOptions,
    handleEquipmentChange,
    
    // Form submission
    handleSubmit,
  } = useMaintenanceForm(onSubmit, onOpenChange, initialDate);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Create New Maintenance Task</DialogTitle>
            <DialogDescription>
              Fill in the details to schedule a new maintenance task.
              {initialDate && (
                <span className="block mt-1 text-sm font-medium">
                  Scheduled for: {initialDate.toLocaleDateString()}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <TaskFormFields
              title={title}
              setTitle={setTitle}
              equipment={equipment}
              setEquipment={setEquipment}
              type={type}
              setType={setType}
              priority={priority}
              setPriority={setPriority}
              dueDate={dueDate}
              setDueDate={setDueDate}
              estimatedDuration={estimatedDuration}
              setEstimatedDuration={setEstimatedDuration}
              assignedTo={assignedTo}
              setAssignedTo={setAssignedTo}
              notes={notes}
              setNotes={setNotes}
              equipmentOptions={equipmentOptions}
              handleEquipmentChange={handleEquipmentChange}
              staffOptions={staffOptions}
              onAddStaffClick={() => setIsAddStaffDialogOpen(true)}
            />
            <DialogFooter>
              <Button type="submit">Create Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AddStaffDialog
        open={isAddStaffDialogOpen}
        onOpenChange={setIsAddStaffDialogOpen}
        newStaffName={newStaffName}
        setNewStaffName={setNewStaffName}
        onAddStaff={handleAddStaff}
      />
    </>
  );
};

export default NewTaskDialog;
