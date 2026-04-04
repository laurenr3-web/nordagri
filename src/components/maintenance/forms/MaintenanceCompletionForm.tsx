
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, Gauge, Plus, X } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MaintenanceTask } from '@/hooks/maintenance/maintenanceSlice';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const maintenanceCompletionSchema = z.object({
  completedDate: z.date(),
  actualDuration: z.number().min(0, "La durée doit être positive"),
  notes: z.string().optional(),
  technician: z.string().min(1, "Le nom du technicien est requis"),
  completedAtHours: z.number().min(0).optional(),
  completedAtKm: z.number().min(0).optional(),
  partsReplaced: z.array(z.object({
    name: z.string().min(1),
    quantity: z.number().min(1),
    partNumber: z.string().optional(),
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
  const triggerUnit = task.trigger_unit || 'none';
  const [parts, setParts] = useState<{ name: string; quantity: number; partNumber: string }[]>([]);
  
  const defaultValues: Partial<MaintenanceCompletionFormValues> = {
    completedDate: new Date(),
    actualDuration: task.engineHours,
    notes: '',
    technician: task.assignedTo || '',
    completedAtHours: triggerUnit === 'hours' ? (task.trigger_hours || 0) : undefined,
    completedAtKm: triggerUnit === 'kilometers' ? (task.trigger_kilometers || 0) : undefined,
    partsReplaced: []
  };

  const form = useForm<MaintenanceCompletionFormValues>({
    resolver: zodResolver(maintenanceCompletionSchema),
    defaultValues,
  });

  const addPart = () => {
    setParts([...parts, { name: '', quantity: 1, partNumber: '' }]);
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const updatePart = (index: number, field: string, value: string | number) => {
    const updated = [...parts];
    updated[index] = { ...updated[index], [field]: value };
    setParts(updated);
  };

  const handleSubmit = (values: MaintenanceCompletionFormValues) => {
    onSubmit({ ...values, partsReplaced: parts.length > 0 ? parts : undefined });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
        <div className="bg-secondary/30 p-3 rounded-md">
          <h3 className="text-sm font-medium mb-2">Détails de la tâche</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Titre</Label>
              <p className="font-medium text-sm">{task.title}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Équipement</Label>
              <p className="font-medium text-sm">{task.equipment}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                        variant="outline"
                        className={`w-full pl-3 text-left font-normal flex justify-between items-center ${!field.value ? "text-muted-foreground" : ""}`}
                      >
                        {field.value ? format(field.value, "d MMMM yyyy", { locale: fr }) : <span>Choisir une date</span>}
                        <CalendarIcon className="h-4 w-4 ml-2" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={fr} />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="actualDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée réelle (heures)</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <Input type="number" min="0" step="0.5" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)} />
                    <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technician"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Technicien</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du technicien" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(triggerUnit === 'hours' || triggerUnit === 'none') && (
            <FormField
              control={form.control}
              name="completedAtHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-primary" />
                    Heures moteur à l'entretien
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" min="0" step="1" placeholder="Ex: 1250"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {(triggerUnit === 'kilometers' || triggerUnit === 'none') && (
            <FormField
              control={form.control}
              name="completedAtKm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <Gauge className="h-4 w-4 text-primary" />
                    Kilomètres à l'entretien
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="number" min="0" step="1" placeholder="Ex: 45000"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observations, problèmes rencontrés..." className="min-h-[80px]" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Pièces utilisées */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Pièces utilisées</Label>
            <Button type="button" variant="outline" size="sm" onClick={addPart} className="flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" />
              Ajouter une pièce
            </Button>
          </div>
          
          {parts.length === 0 && (
            <p className="text-xs text-muted-foreground">Aucune pièce ajoutée. Cliquez sur « Ajouter une pièce » si des pièces ont été utilisées.</p>
          )}

          {parts.map((part, index) => (
            <div key={index} className="flex items-start gap-2 rounded-lg border p-3">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Nom de la pièce</Label>
                  <Input
                    placeholder="Ex: Filtre à huile"
                    value={part.name}
                    onChange={(e) => updatePart(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">N° de pièce</Label>
                  <Input
                    placeholder="Optionnel"
                    value={part.partNumber}
                    onChange={(e) => updatePart(index, 'partNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Quantité</Label>
                  <Input
                    type="number" min="1" value={part.quantity}
                    onChange={(e) => updatePart(index, 'quantity', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => removePart(index)} className="shrink-0 mt-5">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enregistrement..." : "Valider la maintenance"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
