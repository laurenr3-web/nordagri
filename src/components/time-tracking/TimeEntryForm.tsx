import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: any) => void;
}

interface Equipment {
  id: number;
  name: string;
}

interface Intervention {
  id: number;
  title: string;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const [formData, setFormData] = useState({
    equipment_id: undefined as number | undefined,
    intervention_id: undefined as number | undefined,
    task_type: 'maintenance' as TimeEntryTaskType,
    custom_task_type: '', // New field for custom task type
    notes: '',
  });
  
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Load equipments when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEquipments();
    }
  }, [isOpen]);
  
  // Load interventions when equipment changes
  useEffect(() => {
    if (formData.equipment_id) {
      fetchInterventions(formData.equipment_id);
    } else {
      setInterventions([]);
    }
  }, [formData.equipment_id]);
  
  // Fetch equipment list
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
  
  // Fetch interventions related to selected equipment
  const fetchInterventions = async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('id, title')
        .eq('equipment_id', equipmentId)
        .order('date', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Explicit type conversion to ensure type compatibility
        const typedInterventions: Intervention[] = data.map(item => ({
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
      // Reset custom task type when switching away from "other"
      setFormData(prev => ({
        ...prev,
        custom_task_type: ''
      }));
    }
    
    // Clear error when fields change
    setFormError(null);
  };
  
  const handleSubmit = () => {
    // Validate that equipment is selected
    if (!formData.equipment_id) {
      setFormError("Please select an equipment.");
      return;
    }
    
    // Validate custom task type if "other" is selected
    if (formData.task_type === 'other' && !formData.custom_task_type.trim()) {
      setFormError("Please enter a custom task type.");
      return;
    }
    
    // Submit data
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
          
          {/* Equipment selection */}
          <div className="grid gap-2">
            <Label htmlFor="equipment">Equipment *</Label>
            <Select
              value={formData.equipment_id?.toString()}
              onValueChange={(value) => handleChange('equipment_id', parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger id="equipment" className="w-full">
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading...
                  </div>
                ) : (
                  equipments.map((equipment) => (
                    <SelectItem key={equipment.id} value={equipment.id.toString()}>
                      {equipment.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Intervention selection */}
          <div className="grid gap-2">
            <Label htmlFor="intervention">Intervention (optional)</Label>
            <Select
              value={formData.intervention_id?.toString() || undefined}
              onValueChange={(value) => handleChange('intervention_id', parseInt(value))}
              disabled={!formData.equipment_id || interventions.length === 0}
            >
              <SelectTrigger id="intervention" className="w-full">
                <SelectValue placeholder="Select an intervention" />
              </SelectTrigger>
              <SelectContent>
                {interventions.map((intervention) => (
                  <SelectItem key={intervention.id} value={intervention.id.toString()}>
                    {intervention.title}
                  </SelectItem>
                ))}
                {interventions.length === 0 && (
                  <div className="p-2 text-sm text-gray-500">
                    No interventions for this equipment
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Task type */}
          <div className="grid gap-2">
            <Label>Task type *</Label>
            <RadioGroup
              value={formData.task_type}
              onValueChange={(value) => handleChange('task_type', value as TimeEntryTaskType)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="maintenance" id="maintenance" />
                <Label htmlFor="maintenance">Maintenance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="repair" id="repair" />
                <Label htmlFor="repair">Repair</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inspection" id="inspection" />
                <Label htmlFor="inspection">Inspection</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="installation" id="installation" />
                <Label htmlFor="installation">Installation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Custom task type input - only shown when "other" is selected */}
          {formData.task_type === 'other' && (
            <div className="grid gap-2">
              <Label htmlFor="custom_task_type">Custom task type *</Label>
              <Input
                id="custom_task_type"
                value={formData.custom_task_type}
                onChange={(e) => handleChange('custom_task_type', e.target.value)}
                placeholder="Enter task type..."
              />
            </div>
          )}
          
          {/* Notes */}
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
