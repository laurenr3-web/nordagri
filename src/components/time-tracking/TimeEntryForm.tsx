
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TaskTypeField } from './form/TaskTypeField';
import { EquipmentField } from './form/EquipmentField';
import { LocationField } from './form/LocationField';
import { InterventionField } from './form/InterventionField';
import { WorkstationField } from './form/WorkstationField';
import { timeTrackingService } from '@/services/supabase/time-tracking/index';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TimeEntryTaskType } from '@/hooks/time-tracking/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: {
    task_type?: TimeEntryTaskType;
    custom_task_type?: string;
    equipment_id?: number;
    intervention_id?: number;
    title?: string;
    location_id?: number;
    location?: string;
    notes?: string;
    poste_travail?: string;
    description?: string;
  };
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit, initialData }: TimeEntryFormProps) {
  const isMobile = useIsMobile();
  const [taskTypes, setTaskTypes] = useState<{ id: string; name: TimeEntryTaskType }[]>([]);
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
    task_type: 'maintenance' as TimeEntryTaskType,
    task_type_id: '',
    custom_task_type: '',
    equipment_id: undefined as number | undefined,
    intervention_id: undefined as number | undefined,
    title: '',
    description: '',
    notes: '',
    location_id: undefined as number | undefined,
    poste_travail: '',
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Apply initialData when form opens
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData(prev => ({
        ...prev,
        ...(initialData.task_type && { task_type: initialData.task_type }),
        ...(initialData.custom_task_type && { custom_task_type: initialData.custom_task_type }),
        ...(initialData.equipment_id && { equipment_id: initialData.equipment_id }),
        ...(initialData.intervention_id && { intervention_id: initialData.intervention_id }),
        ...(initialData.title && { title: initialData.title }),
        ...(initialData.location_id && { location_id: initialData.location_id }),
        ...(initialData.location && { location: initialData.location }),
        ...(initialData.notes && { notes: initialData.notes }),
        ...(initialData.poste_travail && { poste_travail: initialData.poste_travail }),
        ...(initialData.description && { description: initialData.description })
      }));
    } else if (isOpen) {
      // Reset form when opening without initialData
      setFormData({
        task_type: 'maintenance',
        task_type_id: '',
        custom_task_type: '',
        equipment_id: undefined,
        intervention_id: undefined,
        title: '',
        description: '',
        notes: '',
        location_id: undefined,
        poste_travail: '',
      });
    }
  }, [isOpen, initialData]);
  
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
      setTaskTypes(types || []);  // Ensure we always have an array
      if (types && types.length > 0 && !formData.task_type_id) {
        handleChange('task_type_id', types[0].id);
      }
    } catch (error) {
      console.error('Error loading task types:', error);
      toast.error('Could not load task types');
      setTaskTypes([]); // Set to empty array on error
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
      setEquipments([]); // Set to empty array on error
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
      setInterventions([]); // Set to empty array on error
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
    
    const isEquipmentOrWorkstationSelected = !!(formData.equipment_id || formData.poste_travail);
    
    if (!isEquipmentOrWorkstationSelected) {
      toast.error('Veuillez sélectionner un équipement ou un poste de travail');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Veuillez spécifier un nom pour cette tâche');
      return;
    }
    
    // Si le type est "other" mais le custom_task_type est vide
    if (formData.task_type === 'other' && !formData.custom_task_type.trim()) {
      toast.error('Veuillez spécifier le type de tâche personnalisé');
      return;
    }
    
    const submitData = {
      ...formData
    };
    
    onSubmit(submitData);
  };
  
  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TaskTypeField
        taskType={formData.task_type}
        customTaskType={formData.custom_task_type}
        onChange={handleChange}
      />
      
      <div className="grid gap-2">
        <Label htmlFor="title">🧾 Nom de la tâche *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Entrez un nom pour cette tâche"
          required
        />
      </div>
      
      <EquipmentField
        equipment_id={formData.equipment_id}
        equipments={equipments}
        loading={isLoading}
        onChange={handleChange}
      />
      
      <WorkstationField
        workstation={formData.poste_travail}
        onChange={handleChange}
        required={!formData.equipment_id}
      />
      
      <LocationField
        location_id={formData.location_id}
        locations={locations}
        disabled={false}
        onChange={handleChange}
      />
      
      <InterventionField
        intervention_id={formData.intervention_id}
        interventions={interventions}
        disabled={!formData.equipment_id}
        onChange={handleChange}
      />
      
      <div className="grid gap-2">
        <Label htmlFor="notes">🗒️ Notes / Observations</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Entrez des observations..."
          className="min-h-[100px]"
        />
      </div>
      
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
