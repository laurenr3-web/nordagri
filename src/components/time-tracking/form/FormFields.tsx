
import React from 'react';
import { TaskTypeField } from './TaskTypeField';
import { EquipmentField } from './EquipmentField';
import { InterventionField } from './InterventionField';
import { LocationField } from './LocationField';
import { NotesField } from './NotesField';
import { TimeEntryFormData } from '@/hooks/time-tracking/types';

interface FormFieldsProps {
  formData: TimeEntryFormData;
  equipments: Array<{ id: number; name: string }>;
  interventions: Array<{ id: number; title: string }>;
  locations: Array<{ id: number; name: string }>;
  loading: boolean;
  onChange: (field: string, value: any) => void;
}

export function FormFields({
  formData,
  equipments,
  interventions,
  locations,
  loading,
  onChange
}: FormFieldsProps) {
  // Create wrapper functions to adapt between different function signatures
  const handleTaskTypeChange = (value: string) => {
    onChange('task_type', value);
  };

  const handleCustomTaskTypeChange = (value: string) => {
    onChange('custom_task_type', value);
  };

  return (
    <div className="space-y-4">
      <TaskTypeField
        taskType={formData.task_type}
        customTaskType={formData.custom_task_type}
        onChange={(field, value) => onChange(field, value)}
      />
      
      <EquipmentField
        equipment_id={formData.equipment_id}
        equipments={equipments}
        loading={loading}
        onChange={onChange}
      />
      
      {formData.equipment_id && (
        <InterventionField
          intervention_id={formData.intervention_id}
          interventions={interventions}
          disabled={!formData.equipment_id}
          onChange={onChange}
        />
      )}
      
      <LocationField
        location_id={formData.location_id}
        locations={locations}
        disabled={loading}
        onChange={onChange}
      />
      
      <NotesField 
        value={formData.notes}
        onChange={(value) => onChange('notes', value)}
      />
    </div>
  );
}
