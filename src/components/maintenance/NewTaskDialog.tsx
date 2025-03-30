
import React from 'react';
import { MaintenanceFormValues } from '@/hooks/maintenance/maintenanceSlice';
import { Button } from '@/components/ui/button';
import {
  SafeDialog,
  SafeDialogContent,
  SafeDialogDescription,
  SafeDialogFooter,
  SafeDialogHeader,
  SafeDialogTitle,
} from '@/components/ui/dialog/index';

import { useMaintenanceForm } from '@/hooks/maintenance/useMaintenanceForm';
import TaskFormFields from './TaskFormFields';
import AddStaffDialog from './dialogs/AddStaffDialog';
import ErrorBoundary from '@/components/ErrorBoundary';

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
    <ErrorBoundary>
      <SafeDialog open={open} onOpenChange={onOpenChange}>
        <SafeDialogContent className="sm:max-w-[550px]">
          <SafeDialogHeader>
            <SafeDialogTitle>Create New Maintenance Task</SafeDialogTitle>
            <SafeDialogDescription>
              Fill in the details to schedule a new maintenance task.
              {initialDate && (
                <span className="block mt-1 text-sm font-medium">
                  Scheduled for: {initialDate.toLocaleDateString()}
                </span>
              )}
            </SafeDialogDescription>
          </SafeDialogHeader>
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
            <SafeDialogFooter>
              <Button type="submit">Create Task</Button>
            </SafeDialogFooter>
          </form>
        </SafeDialogContent>
      </SafeDialog>

      <AddStaffDialog
        open={isAddStaffDialogOpen}
        onOpenChange={setIsAddStaffDialogOpen}
        newStaffName={newStaffName}
        setNewStaffName={setNewStaffName}
        onAddStaff={handleAddStaff}
      />
    </ErrorBoundary>
  );
};

export default NewTaskDialog;
