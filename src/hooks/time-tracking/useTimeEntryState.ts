
import { useState } from 'react';
import { TimeEntry, TimeEntryFormData } from './types';

export function useTimeEntryState() {
  // Form state for new time entries
  const [formData, setFormData] = useState<TimeEntryFormData>({
    equipment_id: undefined,
    intervention_id: undefined,
    task_type: 'maintenance',
    custom_task_type: '',
    location_id: undefined,
    location: '',
    notes: '',
  });
  
  // Active time entry state
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

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

  // Helper function to calculate duration from start time
  const calculateInitialDuration = (startTime: string): string => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    formData,
    setFormData,
    handleChange,
    activeTimeEntry,
    setActiveTimeEntry,
    isLoading,
    setIsLoading,
    error,
    setError,
    calculateInitialDuration
  };
}
