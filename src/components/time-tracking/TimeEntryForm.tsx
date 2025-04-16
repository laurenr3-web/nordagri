import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TaskTypeField } from './form/TaskTypeField';
import { EquipmentField } from './form/EquipmentField';
import { LocationField } from './form/LocationField';
import { InterventionField } from './form/InterventionField';
import { WorkstationField } from './form/WorkstationField';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TaskType } from '@/hooks/time-tracking/types';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([]);
  const [equipments, setEquipments] = useState<Array<{ id: number; name: string }>>([]);
  const [interventions, setInterventions] = useState<Array<{ id: number; title: string }>>([]);
  const [locations] = useState<Array<{ id: number; name: string }>>([
    { id: 1, name: "Atelier" },
    { id: 2, name: "Champ Nord" },
    { id: 3, name: "Champ Sud" },
    { id: 4, name: "Hangar" },
    { id: 5, name: "Serre" }
  ]);
  
  const [formData, setFormData] = useState({
    task_type: 'maintenance' as const,
    task_type_id: '',
    custom_task_type: '',
    equipment_id: undefined as number | undefined,
    intervention_id: undefined as number | undefined,
    title: '',
    description: '',
    notes: '',
    location_id: undefined as number | undefined,
    poste_travail: '',
    priority: 'medium' as const
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (isOpen) {
      loadTaskTypes();
      loadEquipments();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (formData.equipment_id) {
      loadInterventions(formData.equipment_id);
    } else {
      setInterventions([]);
    }
  }, [formData.equipment_id]);
  
  const loadTaskTypes = async () => {
    try {
      const types = await timeTrackingService.getTaskTypes();
      setTaskTypes(types);
      if (types.length > 0) {
        handleChange('task_type_id', types[0].id);
      }
    } catch (error) {
      console.error('Error loading task types:', error);
      toast.error('Could not load task types');
    }
  };
  
  const loadEquipments = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      setEquipments(data || []);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading equipment:', error);
      toast.error('Could not load equipment list');
      setIsLoading(false);
    }
  };
  
  const loadInterventions = async (equipmentId: number) => {
    try {
      const { data, error } = await supabase
        .from('interventions')
        .select('id, title')
        .eq('equipment_id', equipmentId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      setInterventions(data || []);
    } catch (error) {
      console.error('Error loading interventions:', error);
      setInterventions([]);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipment_id && !formData.poste_travail) {
      toast.error('Veuillez sélectionner un équipement ou un poste de travail');
      return;
    }
    
    const submitData = {
      ...formData,
      priority: formData.priority || 'medium',
    };
    
    onSubmit(submitData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Démarrer une nouvelle session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <TaskTypeField
            taskType={formData.task_type}
            customTaskType={formData.custom_task_type}
            onChange={handleChange}
          />
          
          <EquipmentField
            equipment_id={formData.equipment_id}
            equipments={equipments}
            loading={isLoading}
            onChange={handleChange}
          />
          
          {!formData.equipment_id && (
            <WorkstationField
              workstation={formData.poste_travail}
              onChange={handleChange}
              required={!formData.equipment_id}
            />
          )}
          
          <InterventionField
            intervention_id={formData.intervention_id}
            interventions={interventions}
            disabled={!formData.equipment_id}
            onChange={handleChange}
          />
          
          <LocationField
            location_id={formData.location_id}
            locations={locations}
            disabled={false}
            onChange={handleChange}
          />
          
          <div className="grid gap-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a title for this session"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Enter a description..."
              className="min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              Démarrer la session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
