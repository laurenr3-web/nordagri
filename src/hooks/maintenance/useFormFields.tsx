
import { useState, useEffect } from 'react';
import { MaintenanceFormValues, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';

export const useFormFields = (initialDate?: Date) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MaintenanceType>('preventive');
  const [priority, setPriority] = useState<MaintenancePriority>('medium');
  const [dueDate, setDueDate] = useState<Date>(initialDate || new Date());
  const [engineHours, setEngineHours] = useState('0');
  const [notes, setNotes] = useState('');
  const [trigger_unit, setTrigger_unit] = useState<string>('none');
  const [trigger_hours, setTrigger_hours] = useState(0);
  const [trigger_kilometers, setTrigger_kilometers] = useState(0);
  
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
    setTrigger_unit('none');
    setTrigger_hours(0);
    setTrigger_kilometers(0);
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
    trigger_unit,
    setTrigger_unit,
    trigger_hours,
    setTrigger_hours,
    trigger_kilometers,
    setTrigger_kilometers,
    resetForm
  };
};
