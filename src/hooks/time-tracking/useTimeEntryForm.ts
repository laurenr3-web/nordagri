
import { useState } from 'react';
import { TimeEntryFormData } from './types';
import { useTimeEntryValidation } from './useTimeEntryValidation';
import { useTimeEntryDataFetching } from './useTimeEntryDataFetching';

export function useTimeEntryForm() {
  const [formData, setFormData] = useState<TimeEntryFormData>({
    notes: '',
    task_type: 'maintenance',
    custom_task_type: '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const {
    formError,
    validateForm,
    setFormError
  } = useTimeEntryValidation();

  const {
    equipments,
    interventions,
    locations,
    loading,
    fetchEquipments,
    fetchLocations
  } = useTimeEntryDataFetching();

  return {
    formData,
    equipments,
    interventions,
    locations,
    loading,
    formError,
    handleChange,
    setFormData,
    validateForm,
    fetchEquipments,
    fetchLocations
  };
}
