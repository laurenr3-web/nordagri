
import React from 'react';
import { MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

import TitleField from './fields/TitleField';
import EquipmentField from './fields/EquipmentField';
import TaskTypeField from './fields/TaskTypeField';
import PriorityField from './fields/PriorityField';
import DueDateField from './fields/DueDateField';
import EngineHoursField from './fields/EngineHoursField';
import AssignedToField from './fields/AssignedToField';
import NotesField from './fields/NotesField';

interface TaskFormFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  equipment: string;
  setEquipment: (equipment: string) => void;
  type: MaintenanceType;
  setType: (type: MaintenanceType) => void;
  priority: MaintenancePriority;
  setPriority: (priority: MaintenancePriority) => void;
  dueDate: Date;
  setDueDate: (date: Date) => void;
  engineHours: string;
  setEngineHours: (hours: string) => void;
  assignedTo: string;
  setAssignedTo: (staff: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  equipmentOptions: Array<{ id: number; name: string }>;
  handleEquipmentChange: (value: string) => void;
  staffOptions: string[];
  onAddStaffClick: () => void;
  isLoading?: boolean;
  isLoadingStaff?: boolean;
}

const TaskFormFields: React.FC<TaskFormFieldsProps> = ({
  title,
  setTitle,
  equipment,
  type,
  setType,
  priority,
  setPriority,
  dueDate,
  setDueDate,
  engineHours,
  setEngineHours,
  assignedTo,
  setAssignedTo,
  notes,
  setNotes,
  equipmentOptions,
  handleEquipmentChange,
  staffOptions,
  onAddStaffClick,
  isLoading = false,
  isLoadingStaff = false,
}) => {
  return (
    <div className="grid gap-4 py-4">
      <TitleField 
        title={title} 
        setTitle={setTitle} 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <EquipmentField 
          equipment={equipment}
          handleEquipmentChange={handleEquipmentChange}
          equipmentOptions={equipmentOptions}
          isLoading={isLoading}
        />
        
        <TaskTypeField 
          type={type}
          setType={setType}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <PriorityField 
          priority={priority}
          setPriority={setPriority}
        />
        
        <DueDateField 
          dueDate={dueDate}
          setDueDate={setDueDate}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <EngineHoursField 
          engineHours={engineHours}
          setEngineHours={setEngineHours}
        />
        
        <AssignedToField 
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          staffOptions={staffOptions}
          onAddStaffClick={onAddStaffClick}
          isLoadingStaff={isLoadingStaff}
        />
      </div>
      
      <NotesField 
        notes={notes}
        setNotes={setNotes}
      />
    </div>
  );
};

export default TaskFormFields;
