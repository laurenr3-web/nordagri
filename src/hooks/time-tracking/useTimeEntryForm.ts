
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryTaskType } from './types';

interface TimeEntryFormData {
  equipment_id?: number;
  intervention_id?: number;
  task_type: TimeEntryTaskType;
  custom_task_type: string;
  notes: string;
}

export function useTimeEntryForm() {
  const [formData, setFormData] = useState<TimeEntryFormData>({
    equipment_id: undefined,
    intervention_id: undefined,
    task_type: 'maintenance',
    custom_task_type: '',
    notes: '',
  });
  
  const [equipments, setEquipments] = useState<Array<{ id: number; name: string }>>([]);
  const [interventions, setInterventions] = useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (formData.equipment_id) {
      fetchInterventions(formData.equipment_id);
    } else {
      setInterventions([]);
    }
  }, [formData.equipment_id]);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setEquipments(data || []);
    } catch (error) {
      console.error("Error loading equipment:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchInterventions = async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('id, title')
        .eq('equipment_id', equipmentId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setInterventions(data || []);
    } catch (error) {
      console.error("Error loading interventions:", error);
      setInterventions([]);
    }
  };

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
    
    setFormError(null);
  };

  const validateForm = () => {
    if (!formData.equipment_id) {
      setFormError("Please select an equipment.");
      return false;
    }
    
    if (formData.task_type === 'other' && !formData.custom_task_type.trim()) {
      setFormError("Please enter a custom task type.");
      return false;
    }
    
    return true;
  };

  return {
    formData,
    equipments,
    interventions,
    loading,
    formError,
    setFormError,
    handleChange,
    validateForm,
    fetchEquipments
  };
}

