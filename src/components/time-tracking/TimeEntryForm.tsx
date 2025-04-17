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

interface TimeEntryFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => void;
  defaultValues?: Partial<TimeEntryFormValues>;
}

export function TimeEntryForm({ isOpen, onOpenChange, onSubmit, defaultValues }: TimeEntryFormProps) {
  const [taskTypes, setTaskTypes] = useState<any[]>([]);
  
  // Form definition with default values
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      equipment_id: defaultValues?.equipment_id,
      intervention_id: defaultValues?.intervention_id,
      task_type: defaultValues?.task_type || 'maintenance',
      task_type_id: defaultValues?.task_type_id,
      custom_task_type: defaultValues?.custom_task_type,
      title: defaultValues?.title,
      notes: defaultValues?.notes,
      location: defaultValues?.location,
      poste_travail: defaultValues?.poste_travail,
    },
  });
  
  // Fetch task types when component mounts
  useEffect(() => {
    const fetchTaskTypes = async () => {
      try {
        const types = await timeTrackingService.getTaskTypes();
        setTaskTypes(types);
        
        // Si task_type et pas task_type_id, essayer de trouver l'ID correspondant
        if (defaultValues?.task_type && !defaultValues?.task_type_id) {
          const matchedType = types.find(t => 
            t.name.toLowerCase() === defaultValues.task_type.toLowerCase());
          
          if (matchedType) {
            form.setValue('task_type_id', matchedType.id);
          }
        }
      } catch (error) {
        console.error("Error fetching task types:", error);
      }
    };
    
    fetchTaskTypes();
  }, []);

  // Handle form submission
  const handleSubmit = async (values: TimeEntryFormValues) => {
    try {
      // Si c'est un type de tâche standard, trouvons l'ID correspondant
      if (values.task_type !== 'other') {
        const matchedType = taskTypes.find(t => 
          t.name.toLowerCase() === values.task_type.toLowerCase());
          
        if (matchedType) {
          values.task_type_id = matchedType.id;
        }
      }
      
      // Si c'est 'other' mais qu'aucun custom_task_type n'est fourni, utiliser "Autre"
      if (values.task_type === 'other' && (!values.custom_task_type || values.custom_task_type.trim() === '')) {
        values.custom_task_type = 'Autre';
      }
      
      // S'assurer que task_type_id est défini si possible
      if (!values.task_type_id && values.custom_task_type) {
        // Chercher dans les types existants pour voir si le custom_task_type correspond à un type existant
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
  
  // Update form values when props change
  useEffect(() => {
    if (defaultValues) {
      Object.entries(defaultValues).forEach(([key, value]) => {
        form.setValue(key as any, value);
      });
    }
  }, [defaultValues]);

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
                  value={field.value} 
                  onChange={(value) => form.setValue('equipment_id', value)} 
                />
              )}
            />
            
            {/* Intervention */}
            <FormField
              control={form.control}
              name="intervention_id"
              render={({ field }) => (
                <InterventionField 
                  value={field.value} 
                  onChange={(value) => form.setValue('intervention_id', value)} 
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
                  value={field.value || ''} 
                  onChange={(value) => form.setValue('location', value)} 
                />
              )}
            />
            
            {/* Poste de travail */}
            <FormField
              control={form.control}
              name="poste_travail"
              render={({ field }) => (
                <WorkstationField 
                  value={field.value || ''} 
                  onChange={(value) => form.setValue('poste_travail', value)} 
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
