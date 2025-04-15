
import { useState } from 'react';
import { TimeEntryFormData } from './types';

export function useTimeEntryState() {
  const [formData, setFormData] = useState<TimeEntryFormData>({
    equipment_id: undefined,
    intervention_id: undefined,
    task_type: 'maintenance',
    custom_task_type: '',
    location_id: undefined,
    location: '',
    notes: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (field === 'task_type' && value !== 'other') {
      setFormData(prev => ({
        ...prev,
        custom_task_type: ''
      }));
    }
  };

  return {
    formData,
    setFormData,
    handleChange
  };
}
