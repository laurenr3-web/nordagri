import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MaintenanceFrequency, MaintenancePlan, MaintenanceUnit } from '@/hooks/maintenance/useMaintenancePlanner';
import { MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import { TriggerThresholdFields } from '../fields/TriggerThresholdFields';

// Schema de validation pour le formulaire de plan de maintenance
const maintenancePlanSchema = z.object({
  title: z.string().min(3, "Le titre doit comporter au moins 3 caractères."),
  description: z.string().optional(),
  equipmentId: z.number().min(1, "Équipement requis"),
  equipmentName: z.string().min(1, "Nom de l'équipement requis"),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'custom']),
  interval: z.number().min(1, "L'intervalle doit être d'au moins 1"),
  unit: z.enum(['days', 'weeks', 'months', 'years', 'hours']),
  type: z.enum(['preventive', 'corrective', 'condition-based']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  engineHours: z.number().min(0, "Les heures moteur doivent être positives"),
  nextDueDate: z.date(),
  assignedTo: z.string().optional(),
  trigger_unit: z.enum(['hours', 'kilometers', 'none']).default('none'),
  trigger_hours: z.number().nullable().optional(),
  trigger_kilometers: z.number().nullable().optional(),
});

type MaintenancePlanFormValues = z.infer<typeof maintenancePlanSchema>;

interface MaintenancePlanFormProps {
  onSubmit: (data: Omit<MaintenancePlan, 'id' | 'active'>) => void;
  equipment: { id: number; name: string } | null;
  initialData?: Partial<MaintenancePlan>;
  isSubmitting?: boolean;
}

export default function MaintenancePlanForm({ 
  onSubmit, 
  equipment, 
  initialData, 
  isSubmitting = false 
}: MaintenancePlanFormProps) {
  // Définir les valeurs par défaut
  const defaultValues: Partial<MaintenancePlanFormValues> = {
    title: initialData?.title || '',
    description: initialData?.description || '',
    equipmentId: equipment?.id || initialData?.equipmentId || 0,
    equipmentName: equipment?.name || initialData?.equipmentName || '',
    frequency: initialData?.frequency || 'monthly',
    interval: initialData?.interval || 1,
    unit: initialData?.unit || 'months',
    type: initialData?.type || 'preventive',
    priority: initialData?.priority || 'medium',
    engineHours: initialData?.engineHours || 1,
    nextDueDate: initialData?.nextDueDate || new Date(),
    assignedTo: initialData?.assignedTo || '',
    trigger_unit: initialData?.trigger_unit || 'none',
    trigger_hours: initialData?.trigger_hours || null,
    trigger_kilometers: initialData?.trigger_kilometers || null,
  };

  // Initialiser le formulaire avec les valeurs par défaut et le schéma de validation
  const form = useForm<MaintenancePlanFormValues>({
    resolver: zodResolver(maintenancePlanSchema),
    defaultValues,
  });

  // Gestionnaire de soumission du formulaire
  const handleSubmit = (values: MaintenancePlanFormValues) => {
    // Ensure all required fields are present with proper types
    const maintenancePlan: Omit<MaintenancePlan, 'id' | 'active'> = {
      title: values.title,
      description: values.description || '',
      equipmentId: values.equipmentId,
      equipmentName: values.equipmentName,
      frequency: values.frequency,
      interval: values.interval,
      unit: values.unit,
      type: values.type,
      priority: values.priority,
      engineHours: values.engineHours,
      nextDueDate: values.nextDueDate,
      assignedTo: values.assignedTo
    };
    
    onSubmit(maintenancePlan);
  };

  // Options pour les fréquences de maintenance
  const frequencyOptions: { value: MaintenanceFrequency; label: string }[] = [
    { value: 'daily', label: 'Quotidienne' },
    { value: 'weekly', label: 'Hebdomadaire' },
    { value: 'monthly', label: 'Mensuelle' },
    { value: 'quarterly', label: 'Trimestrielle' },
    { value: 'biannual', label: 'Semestrielle' },
    { value: 'annual', label: 'Annuelle' },
    { value: 'custom', label: 'Personnalisée' },
  ];

  // Options pour les unités de temps
  const unitOptions: { value: MaintenanceUnit; label: string }[] = [
    { value: 'days', label: 'Jours' },
    { value: 'weeks', label: 'Semaines' },
    { value: 'months', label: 'Mois' },
    { value: 'years', label: 'Années' },
    { value: 'hours', label: 'Heures de fonctionnement' },
  ];

  // Options pour les types de maintenance
  const typeOptions: { value: MaintenanceType; label: string }[] = [
    { value: 'preventive', label: 'Préventive' },
    { value: 'corrective', label: 'Corrective' },
    { value: 'condition-based', label: 'Basée sur condition' },
  ];

  // Options pour les priorités
  const priorityOptions: { value: MaintenancePriority; label: string }[] = [
    { value: 'low', label: 'Basse' },
    { value: 'medium', label: 'Moyenne' },
    { value: 'high', label: 'Haute' },
    { value: 'critical', label: 'Critique' },
  ];

  // Obtenir la valeur actuelle de la fréquence
  const currentFrequency = form.watch('frequency');
  const isCustomFrequency = currentFrequency === 'custom';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Titre */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Titre du plan de maintenance</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Vidange moteur périodique" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Description (optionnelle)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Décrivez les tâches à effectuer pour cette maintenance..."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Équipement */}
          <div className="md:col-span-2">
            <div className="bg-secondary/30 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium mb-2">Équipement concerné</h3>
              <p className="text-base font-semibold">{equipment?.name || initialData?.equipmentName || "Aucun équipement sélectionné"}</p>
              
              {/* Champs cachés pour stocker les valeurs de l'équipement */}
              <input 
                type="hidden"
                {...form.register("equipmentId", { valueAsNumber: true })}
                value={equipment?.id || initialData?.equipmentId || 0}
              />
              <input 
                type="hidden"
                {...form.register("equipmentName")}
                value={equipment?.name || initialData?.equipmentName || ""}
              />
            </div>
          </div>

          {/* Fréquence */}
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fréquence</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une fréquence" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {frequencyOptions.map(option => (
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

          {/* Intervalle */}
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
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                  />
                </FormControl>
                <FormDescription>
                  Nombre de périodes entre chaque maintenance
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Unité (visible uniquement si fréquence = custom) */}
          {isCustomFrequency && (
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unité</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une unité" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitOptions.map(option => (
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
          )}

          {/* Type de maintenance */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de maintenance</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {typeOptions.map(option => (
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

          {/* Priorité */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une priorité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {priorityOptions.map(option => (
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

          {/* Heures moteur estimées */}
          <FormField
            control={form.control}
            name="engineHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heures moteur estimées</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.5"
                      {...field} 
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                    <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                  </div>
                </FormControl>
                <FormDescription>
                  Durée estimée de l'intervention
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date de prochaine maintenance */}
          <FormField
            control={form.control}
            name="nextDueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de prochaine maintenance</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={`w-full pl-3 text-left font-normal flex justify-between items-center ${!field.value ? "text-muted-foreground" : ""}`}
                      >
                        {field.value ? (
                          format(field.value, "d MMMM yyyy", { locale: fr })
                        ) : (
                          <span>Choisir une date</span>
                        )}
                        <CalendarIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Assigné à */}
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigné à (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du technicien ou de l'équipe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

        </div>

        
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-medium mb-4">Conditions de déclenchement</h3>
          <TriggerThresholdFields form={form} equipment={equipment} />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Créer le plan de maintenance"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
