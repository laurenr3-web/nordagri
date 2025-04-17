
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { timeTrackingService } from '@/services/supabase/timeTrackingService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EquipmentField } from './form/EquipmentField';
import { InterventionField } from './form/InterventionField';
import { LocationField } from './form/LocationField';
import { TaskTypeField } from './form/TaskTypeField';
import { WorkstationField } from './form/WorkstationField';

// Schéma de validation amélioré
const timeEntrySchema = z.object({
  equipment_id: z.number().optional(),
  intervention_id: z.number().optional(),
  task_type: z.string().min(1, "Le type de tâche est requis"),
  task_type_id: z.string().optional(),
  custom_task_type: z.string().optional(),
  title: z.string().optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
  poste_travail: z.string().optional(),
});

type TimeEntryFormValues = z.infer<typeof timeEntrySchema>;

export interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<TimeEntryFormValues>;
  defaultValues?: Partial<TimeEntryFormValues>;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit, initialData, defaultValues }: TimeEntryFormProps) {
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form definition with default values or initialData values
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      equipment_id: initialData?.equipment_id || defaultValues?.equipment_id,
      intervention_id: initialData?.intervention_id || defaultValues?.intervention_id,
      task_type: initialData?.task_type || defaultValues?.task_type || 'maintenance',
      task_type_id: initialData?.task_type_id || defaultValues?.task_type_id,
      custom_task_type: initialData?.custom_task_type || defaultValues?.custom_task_type,
      title: initialData?.title || defaultValues?.title,
      notes: initialData?.notes || defaultValues?.notes,
      location: initialData?.location || defaultValues?.location,
      poste_travail: initialData?.poste_travail || defaultValues?.poste_travail,
    },
  });
  
  // Fetch necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch task types
        const types = await timeTrackingService.getTaskTypes();
        setTaskTypes(types);
        
        // Fetch equipments
        const { data: equipmentsData } = await supabase
          .from('equipment')
          .select('id, name')
          .order('name');
        setEquipments(equipmentsData || []);
        
        // If equipment_id is set, fetch interventions for that equipment
        const equipmentId = form.watch('equipment_id');
        if (equipmentId) {
          const { data: interventionsData } = await supabase
            .from('interventions')
            .select('id, title')
            .eq('equipment_id', equipmentId)
            .order('date', { ascending: false });
          setInterventions(interventionsData || []);
        }
        
        // Set some mock locations for now
        setLocations([
          { id: 1, name: "Atelier" },
          { id: 2, name: "Champ Nord" },
          { id: 3, name: "Champ Sud" },
          { id: 4, name: "Hangar" },
          { id: 5, name: "Serre" }
        ]);
        
        // Match task_type to task_type_id if needed
        if ((initialData?.task_type || defaultValues?.task_type) && 
            !(initialData?.task_type_id || defaultValues?.task_type_id)) {
          const matchedType = types.find(t => 
            t.name.toLowerCase() === (initialData?.task_type || defaultValues?.task_type || '').toLowerCase());
          
          if (matchedType) {
            form.setValue('task_type_id', matchedType.id);
          }
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update interventions when equipment changes
  useEffect(() => {
    const equipmentId = form.watch('equipment_id');
    if (equipmentId) {
      const fetchInterventions = async () => {
        const { data } = await supabase
          .from('interventions')
          .select('id, title')
          .eq('equipment_id', equipmentId)
          .order('date', { ascending: false });
        setInterventions(data || []);
      };
      fetchInterventions();
    } else {
      setInterventions([]);
    }
  }, [form.watch('equipment_id')]);

  // Handle form submission
  const handleSubmit = async (values: TimeEntryFormValues) => {
    try {
      // If it's a standard task type, find the corresponding ID
      if (values.task_type !== 'other') {
        const matchedType = taskTypes.find(t => 
          t.name.toLowerCase() === values.task_type.toLowerCase());
          
        if (matchedType) {
          values.task_type_id = matchedType.id;
        }
      }
      
      // If it's 'other' but no custom_task_type is provided, use "Autre"
      if (values.task_type === 'other' && (!values.custom_task_type || values.custom_task_type.trim() === '')) {
        values.custom_task_type = 'Autre';
      }
      
      // Try to find task_type_id if possible
      if (!values.task_type_id && values.custom_task_type) {
        const matchedType = taskTypes.find(t => 
          t.name.toLowerCase() === values.custom_task_type?.toLowerCase());
          
        if (matchedType) {
          values.task_type_id = matchedType.id;
        }
      }
      
      onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erreur lors de la création de la session");
    }
  };
  
  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      Object.entries(initialData).forEach(([key, value]) => {
        if (value !== undefined) {
          form.setValue(key as any, value);
        }
      });
    }
  }, [initialData]);

  const handleFieldChange = (field: string, value: any) => {
    form.setValue(field as any, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouvelle session de travail</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Type de tâche */}
            <FormField
              control={form.control}
              name="task_type"
              render={({ field }) => (
                <TaskTypeField
                  taskType={field.value as any}
                  customTaskType={form.watch('custom_task_type') || ''}
                  onChange={(name, value) => {
                    if (name === 'task_type') {
                      form.setValue('task_type', value);
                      
                      // Si on sélectionne un type standard, chercher l'ID correspondant
                      if (value !== 'other') {
                        const matchedType = taskTypes.find(t => t.name.toLowerCase() === value.toLowerCase());
                        if (matchedType) {
                          form.setValue('task_type_id', matchedType.id);
                        }
                      } else {
                        // Si "other" est sélectionné, réinitialiser task_type_id
                        form.setValue('task_type_id', undefined);
                      }
                    } else {
                      form.setValue(name as any, value);
                    }
                  }}
                />
              )}
            />

            {/* Équipement */}
            <FormField
              control={form.control}
              name="equipment_id"
              render={({ field }) => (
                <EquipmentField 
                  equipment_id={field.value} 
                  equipments={equipments}
                  loading={loading}
                  onChange={handleFieldChange} 
                />
              )}
            />
            
            {/* Intervention */}
            <FormField
              control={form.control}
              name="intervention_id"
              render={({ field }) => (
                <InterventionField 
                  intervention_id={field.value} 
                  interventions={interventions}
                  disabled={!form.watch('equipment_id')}
                  onChange={handleFieldChange} 
                />
              )}
            />
            
            {/* Titre */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la session" {...field} value={field.value || ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* Lieu */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <LocationField 
                  location={field.value}
                  locations={locations}
                  disabled={false}
                  onChange={handleFieldChange}
                />
              )}
            />
            
            {/* Poste de travail */}
            <FormField
              control={form.control}
              name="poste_travail"
              render={({ field }) => (
                <WorkstationField
                  workstation={field.value}
                  onChange={handleFieldChange}
                />
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notes sur la session..." {...field} value={field.value || ''} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">Démarrer la session</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
