
import React from 'react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Clock, Users } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { InterventionFormValues } from '@/types/Intervention';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Le titre doit contenir au moins 2 caractères",
  }),
  equipment: z.string({
    required_error: "Veuillez sélectionner un équipement",
  }),
  equipmentId: z.number({
    required_error: "L'ID de l'équipement est requis",
  }),
  location: z.string({
    required_error: "La localisation est requise",
  }),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Veuillez sélectionner une priorité",
  }),
  date: z.date({
    required_error: "La date est requise",
  }),
  scheduledDuration: z.coerce
    .number()
    .min(0.5, {
      message: "La durée doit être d'au moins 30 minutes",
    })
    .default(1),
  technician: z.string().optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewInterventionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (intervention: InterventionFormValues) => void;
  equipments?: { id: number; name: string }[];
  technicians?: { id: string; name: string }[];
}

const NewInterventionDialog: React.FC<NewInterventionDialogProps> = ({ 
  open, 
  onOpenChange,
  onCreate,
  equipments = [],
  technicians = []
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      equipment: "",
      equipmentId: 0,
      location: "",
      priority: "medium",
      date: new Date(),
      scheduledDuration: 1,
      technician: "",
      description: "",
      notes: "",
    },
  });
  
  const onSubmit = (values: FormValues) => {
    onCreate(values as InterventionFormValues);
  };

  // Gérer le changement d'équipement pour mettre à jour l'ID
  const handleEquipmentChange = (value: string) => {
    const selectedEquipment = equipments.find(eq => eq.name === value);
    if (selectedEquipment) {
      form.setValue('equipmentId', selectedEquipment.id);
    }
    return value;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouvelle Intervention</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Titre */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de l'intervention" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Équipement */}
              <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Équipement</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(handleEquipmentChange(value))}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un équipement" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipments.map((eq) => (
                          <SelectItem key={eq.id} value={eq.name}>
                            {eq.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Localisation */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Localisation</FormLabel>
                    <FormControl>
                      <Input placeholder="Lieu de l'intervention" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
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
                              <span>Sélectionner une date</span>
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
              
              {/* Durée prévue */}
              <FormField
                control={form.control}
                name="scheduledDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée prévue (heures)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          min="0.5" 
                          step="0.5"
                          {...field} 
                        />
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Durée estimée en heures
                    </FormDescription>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Technicien */}
              <FormField
                control={form.control}
                name="technician"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Technicien</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un technicien">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <span>Assigner un technicien</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {technicians.map((tech) => (
                          <SelectItem key={tech.id} value={tech.name}>
                            {tech.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Description détaillée de l'intervention"
                        rows={3}
                        {...field} 
                      />
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
                        placeholder="Notes ou instructions supplémentaires"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          
            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit">Créer l'intervention</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewInterventionDialog;
