
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

import { MaintenanceFrequency, MaintenanceType, MaintenancePriority, MaintenanceUnit } from '@/hooks/maintenance/types/maintenancePlanTypes';
import EquipmentField from '@/components/maintenance/fields/EquipmentField';
import FormFieldGroup from '@/components/maintenance/fields/FormFieldGroup';

const formSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  description: z.string().optional(),
  equipment: z.string().min(1, "Équipement requis"),
  frequency: z.enum([
    'daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'yearly', 'custom'
  ] as const),
  interval: z.coerce.number().min(1),
  unit: z.enum([
    'days', 'weeks', 'months', 'years', 'hours'
  ] as const),
  nextDueDate: z.date(),
  type: z.enum([
    'preventive', 'predictive', 'corrective', 'inspection', 'lubrication', 
    'electrical', 'mechanical', 'hydraulic', 'other'
  ] as const),
  priority: z.enum(['low', 'medium', 'high', 'critical'] as const),
  engineHours: z.coerce.number().optional(),
  assignedTo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MaintenancePlanFormProps {
  onSubmit: (data: FormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  equipmentOptions: Array<{ id: number; name: string }>;
  isLoadingEquipment?: boolean;
  defaultValues?: Partial<FormValues>;
  staffMembers?: Array<{ id: string; name: string }>;
}

const MaintenancePlanForm: React.FC<MaintenancePlanFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  equipmentOptions,
  isLoadingEquipment = false,
  defaultValues,
  staffMembers = []
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      equipment: defaultValues?.equipment || '',
      frequency: defaultValues?.frequency || 'monthly',
      interval: defaultValues?.interval || 1,
      unit: defaultValues?.unit || 'months',
      nextDueDate: defaultValues?.nextDueDate || new Date(),
      type: defaultValues?.type || 'preventive',
      priority: defaultValues?.priority || 'medium',
      engineHours: defaultValues?.engineHours,
      assignedTo: defaultValues?.assignedTo || '',
    },
  });

  const frequencyOptions: { value: MaintenanceFrequency; label: string }[] = [
    { value: 'daily', label: 'Quotidien' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuel' },
    { value: 'quarterly', label: 'Trimestriel' },
    { value: 'biannual', label: 'Semestriel' },
    { value: 'yearly', label: 'Annuel' },
    { value: 'custom', label: 'Personnalisé' },
  ];

  const unitOptions: { value: MaintenanceUnit; label: string }[] = [
    { value: 'days', label: 'Jours' },
    { value: 'weeks', label: 'Semaines' },
    { value: 'months', label: 'Mois' },
    { value: 'years', label: 'Années' },
    { value: 'hours', label: 'Heures' },
  ];

  const typeOptions: { value: MaintenanceType; label: string }[] = [
    { value: 'preventive', label: 'Préventive' },
    { value: 'predictive', label: 'Prédictive' },
    { value: 'corrective', label: 'Corrective' },
    { value: 'inspection', label: 'Inspection' },
    { value: 'lubrication', label: 'Lubrification' },
    { value: 'electrical', label: 'Électrique' },
    { value: 'mechanical', label: 'Mécanique' },
    { value: 'hydraulic', label: 'Hydraulique' },
    { value: 'other', label: 'Autre' },
  ];

  const priorityOptions: { value: MaintenancePriority; label: string }[] = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
    { value: 'critical', label: 'Critique' },
  ];

  // Watch the frequency value to conditionally show fields
  const frequencyValue = form.watch('frequency');
  const showCustomInterval = frequencyValue === 'custom';
  
  const onFormSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        {/* Title */}
        <FormFieldGroup>
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titre</FormLabel>
                <FormControl>
                  <Input placeholder="Titre du plan de maintenance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormFieldGroup>

        {/* Equipment */}
        <EquipmentField
          equipment={form.watch('equipment')}
          handleEquipmentChange={(value) => form.setValue('equipment', value)}
          equipmentOptions={equipmentOptions}
          isLoading={isLoadingEquipment}
        />

        {/* Type */}
        <FormFieldGroup>
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormFieldGroup>

        {/* Frequency */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldGroup>
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fréquence</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une fréquence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormFieldGroup>
          
          {/* Next due date */}
          <FormFieldGroup>
            <FormField
              control={form.control}
              name="nextDueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prochaine date</FormLabel>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date);
                          setIsCalendarOpen(false);
                        }}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormFieldGroup>
        </div>

        {/* Custom interval and unit */}
        {showCustomInterval && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldGroup>
              <FormField
                control={form.control}
                name="interval"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Intervalle</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        placeholder="Intervalle" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldGroup>
            
            <FormFieldGroup>
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une unité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {unitOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormFieldGroup>
          </div>
        )}

        {/* Priority and Engine Hours */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormFieldGroup>
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priorité</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une priorité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormFieldGroup>
          
          <FormFieldGroup>
            <FormField
              control={form.control}
              name="engineHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heures moteur (optionnel)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Heures moteur" 
                      {...field} 
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormFieldGroup>
        </div>

        {/* Assigned To */}
        {staffMembers.length > 0 && (
          <FormFieldGroup>
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigné à</FormLabel>
                  <Select 
                    value={field.value || ""} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un technicien" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Non assigné</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.name}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormFieldGroup>
        )}

        {/* Description */}
        <FormFieldGroup>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Description de la tâche de maintenance" 
                    className="min-h-[100px]" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormFieldGroup>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaintenancePlanForm;
