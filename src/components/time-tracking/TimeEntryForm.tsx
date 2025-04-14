import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { EquipmentField } from './form/EquipmentField';
import { InterventionField } from './form/InterventionField';
import { TaskTypeField } from './form/TaskTypeField';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => void;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const [formData, setFormData] = useState({
    equipment_id: undefined as number | undefined,
    intervention_id: undefined as number | undefined,
    task_type: 'maintenance' as TimeEntryTaskType,
    custom_task_type: '',
    notes: '',
  });
  
  const [equipments, setEquipments] = useState<Array<{ id: number; name: string }>>([]);
  const [interventions, setInterventions] = useState<Array<{ id: number; title: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    }
  }, [isOpen]);
  
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
      
      if (data) {
        const typedInterventions: Array<{ id: number; title: string }> = data.map(item => ({
          id: item.id,
          title: item.title
        }));
        
        setInterventions(typedInterventions);
      } else {
        setInterventions([]);
      }
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
  
  const handleSubmit = () => {
    if (!formData.equipment_id) {
      setFormError("Please select an equipment.");
      return;
    }
    
    if (formData.task_type === 'other' && !formData.custom_task_type.trim()) {
      setFormError("Please enter a custom task type.");
      return;
    }
    
    onSubmit(formData);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Time Tracking Session</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {formError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
              {formError}
            </div>
          )}
          
          <EquipmentField
            equipment_id={formData.equipment_id}
            equipments={equipments}
            loading={loading}
            onChange={handleChange}
          />
          
          <InterventionField
            intervention_id={formData.intervention_id}
            interventions={interventions}
            disabled={!formData.equipment_id}
            onChange={handleChange}
          />
          
          <TaskTypeField
            taskType={formData.task_type}
            customTaskType={formData.custom_task_type}
            onChange={handleChange}
          />
          
          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add details about the task..."
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Start Tracking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
