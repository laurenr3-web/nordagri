
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
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
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit }: TimeEntryFormProps) {
  const isMobile = useIsMobile();
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
    description: '',
    notes: '',
    location_id: undefined as number | undefined,
    poste_travail: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        task_type: 'maintenance' as const,
        task_type_id: '',
        custom_task_type: '',
        equipment_id: undefined,
        intervention_id: undefined,
        description: '',
        notes: '',
        location_id: undefined,
        poste_travail: '',
      });
      setFormError(null);
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
      if (types.length > 0 && !formData.task_type_id) {
        handleChange('task_type_id', types[0].id);
      }
    } catch (error) {
      console.error('Error loading task types:', error);
      toast.error('Impossible de charger les types de tâches');
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
      toast.error('Impossible de charger la liste des équipements');
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
    
    // Clear formError when user makes changes
    if (formError) {
      setFormError(null);
    }
  };
  
  const validateForm = () => {
    // Validation logic based on requirements
    if (formData.task_type === 'other' && !formData.custom_task_type.trim()) {
      setFormError('Veuillez saisir un nom pour la tâche personnalisée');
      return false;
    }
    
    if (!formData.poste_travail.trim()) {
      setFormError('Veuillez indiquer votre poste de travail');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Prepare data for submission with the right title
    const submitData = {
      ...formData,
      title: formData.task_type === 'other' 
        ? formData.custom_task_type 
        : `${formData.task_type} - ${new Date().toLocaleDateString()}`
    };
    
    onSubmit(submitData);
  };
  
  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Type Field (Required) */}
      <TaskTypeField
        taskType={formData.task_type}
        customTaskType={formData.custom_task_type}
        onChange={handleChange}
      />
      
      {/* Equipment Field (Optional) */}
      <EquipmentField
        equipment_id={formData.equipment_id}
        equipments={equipments}
        loading={isLoading}
        onChange={handleChange}
      />
      
      {/* Workstation Field (Required) */}
      <WorkstationField
        workstation={formData.poste_travail}
        onChange={handleChange}
        required={true}
      />
      
      {/* Location Field (Optional) */}
      <LocationField
        location_id={formData.location_id}
        locations={locations}
        disabled={false}
        onChange={handleChange}
      />
      
      {/* Intervention Field (Optional) - Only enabled if equipment is selected */}
      <InterventionField
        intervention_id={formData.intervention_id}
        interventions={interventions}
        disabled={!formData.equipment_id}
        onChange={handleChange}
      />
      
      {/* Description Field (Optional) */}
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description de la session
        </label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Description détaillée de la session..."
          className="min-h-[100px]"
        />
      </div>
      
      {/* Display form error if any */}
      {formError && (
        <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
          {formError}
        </div>
      )}
      
      <div className="flex justify-end gap-2 pb-6">
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
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Démarrer une nouvelle session</SheetTitle>
          </SheetHeader>
          {FormContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Démarrer une nouvelle session</DialogTitle>
        </DialogHeader>
        {FormContent}
      </DialogContent>
    </Dialog>
  );
}
