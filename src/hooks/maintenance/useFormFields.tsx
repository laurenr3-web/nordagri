
import { useState, useEffect } from 'react';
import { MaintenanceFormValues, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const useFormFields = (initialDate?: Date) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaintenanceType>('preventive');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [dueDate, setDueDate] = useState<Date>(initialDate || new Date());
  const [engineHours, setEngineHours] = useState('0');
  const [notes, setNotes] = useState('');
  
  // Update dueDate when initialDate changes
  useEffect(() => {
    if (initialDate) {
      setDueDate(initialDate);
    }
  }, [initialDate]);

  const resetForm = () => {
    setTitle('');
    setType('preventive');
    setPriority('medium');
    setDueDate(new Date());
    setEngineHours('0');
    setNotes('');
  };
  
  return {
    title,
    setTitle,
    type,
    setType,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    engineHours,
    setEngineHours,
    notes,
    setNotes,
    resetForm
  };
};
