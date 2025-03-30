
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Schéma de validation pour le formulaire de complétion de maintenance
const maintenanceCompletionSchema = z.object({
  completedDate: z.date(),
  actualDuration: z.number().min(0, "La durée doit être positive"),
  notes: z.string().optional(),
  technician: z.string().min(1, "Le nom du technicien est requis"),
  partsReplaced: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    quantity: z.number().min(1, "La quantité doit être d'au moins 1")
  })).optional()
});

type MaintenanceCompletionFormValues = z.infer<typeof maintenanceCompletionSchema>;

interface MaintenanceCompletionFormProps {
  task: MaintenanceTask;
  onSubmit: (data: MaintenanceCompletionFormValues) => void;
  isSubmitting?: boolean;
}

export default function MaintenanceCompletionForm({ 
  task, 
  onSubmit, 
  isSubmitting = false 
}: MaintenanceCompletionFormProps) {
  // Définir les valeurs par défaut
  const defaultValues: Partial<MaintenanceCompletionFormValues> = {
    completedDate: new Date(),
    actualDuration: task.engineHours,
    notes: `Maintenance "${task.title}" complétée pour l'équipement ${task.equipment}.`,
    technician: task.assignedTo || '',
    partsReplaced: []
  };

  // Initialiser le formulaire avec les valeurs par défaut et le schéma de validation
  const form = useForm<MaintenanceCompletionFormValues>({
    resolver: zodResolver(maintenanceCompletionSchema),
    defaultValues,
  });

  // Gestionnaire de soumission du formulaire
  const handleSubmit = (values: MaintenanceCompletionFormValues) => {
    onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="bg-secondary/30 p-4 rounded-md mb-4">
          <h3 className="text-sm font-medium mb-2">Détails de la tâche</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Titre</Label>
              <p className="font-medium">{task.title}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Équipement</Label>
              <p className="font-medium">{task.equipment}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type</Label>
              <p className="font-medium capitalize">{task.type}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priorité</Label>
              <p className="font-medium capitalize">{task.priority}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Date de complétion */}
          <FormField
            control={form.control}
            name="completedDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de réalisation</FormLabel>
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

          {/* Durée réelle */}
          <FormField
            control={form.control}
            name="actualDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée réelle (heures)</FormLabel>
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
                  Durée réelle passée sur l'intervention
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Technicien */}
          <FormField
            control={form.control}
            name="technician"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technicien</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du technicien qui a réalisé la maintenance" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observations, problèmes rencontrés, recommandations..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Valider la maintenance"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
