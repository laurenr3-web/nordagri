
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, AlertTriangle, Clock, Gauge } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useAuthContext } from '@/providers/AuthProvider';

// Schéma de validation pour le formulaire
const maintenanceSchema = z.object({
  title: z.string().min(3, "Le titre doit contenir au moins 3 caractères"),
  type: z.string().min(1, "Le type de maintenance est requis"),
  status: z.enum(["scheduled", "completed"]),
  triggerType: z.enum(["date", "hours", "kilometers"]),
  triggerDate: z.date().optional(),
  triggerHours: z.coerce.number().min(0).optional(),
  triggerKilometers: z.coerce.number().min(0).optional(),
  isRecurrent: z.boolean().default(false),
  recurrenceInterval: z.coerce.number().min(1).optional(),
  notes: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceSchema>;

interface AddMaintenanceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  equipment: any;
}

const maintenanceTypes = [
  { value: "oil_change", label: "Vidange" },
  { value: "inspection", label: "Inspection" },
  { value: "repair", label: "Réparation" },
  { value: "filter_change", label: "Remplacement de filtre" },
  { value: "belt_change", label: "Remplacement de courroie" },
  { value: "tire_change", label: "Remplacement de pneus" },
  { value: "battery_change", label: "Remplacement de batterie" },
  { value: "other", label: "Autre" },
];

const AddMaintenanceDialog: React.FC<AddMaintenanceDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  equipment 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, profileData } = useAuthContext();

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: "",
      type: "",
      status: "scheduled",
      triggerType: "date",
      isRecurrent: false,
      notes: "",
    }
  });

  const triggerType = form.watch("triggerType");
  const isRecurrent = form.watch("isRecurrent");
  const status = form.watch("status");

  const handleSubmit = async (values: MaintenanceFormValues) => {
    try {
      setIsLoading(true);
      
      // Préparer les données pour la soumission
      const maintenanceData = {
        title: values.title,
        type: values.type,
        equipment: equipment.name,
        equipmentId: equipment.id,
        status: values.status,
        priority: "medium",
        dueDate: values.triggerDate || new Date(),
        engineHours: values.triggerHours || 0,
        assignedTo: profileData?.first_name ? `${profileData.first_name} ${profileData.last_name || ''}`.trim() : user?.email,
        notes: values.notes || '',
        trigger_unit: values.triggerType,
        trigger_hours: values.triggerType === "hours" ? values.triggerHours : undefined,
        trigger_kilometers: values.triggerType === "kilometers" ? values.triggerKilometers : undefined,
        is_recurrent: values.isRecurrent,
        recurrence_interval: values.isRecurrent ? values.recurrenceInterval : undefined,
      };

      // Soumettre les données
      await onSubmit(maintenanceData);
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la création de la maintenance:", error);
      toast.error("Impossible de créer la maintenance");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ajouter une maintenance</DialogTitle>
          <DialogDescription>
            Créer une nouvelle tâche de maintenance pour {equipment?.name || "cet équipement"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titre</FormLabel>
                    <FormControl>
                      <Input placeholder="Titre de la maintenance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de maintenance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maintenanceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">À faire</SelectItem>
                          <SelectItem value="completed">Effectuée</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="triggerType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Critère de déclenchement</FormLabel>
                    <Tabs 
                      value={field.value} 
                      onValueChange={field.onChange} 
                      className="w-full"
                    >
                      <TabsList className="grid grid-cols-3">
                        <TabsTrigger value="date" className="flex items-center gap-1">
                          <CalendarIcon size={16} /> Date
                        </TabsTrigger>
                        <TabsTrigger value="hours" className="flex items-center gap-1">
                          <Clock size={16} /> Heures
                        </TabsTrigger>
                        <TabsTrigger value="kilometers" className="flex items-center gap-1">
                          <Gauge size={16} /> Kilomètres
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="date" className="mt-2">
                        <FormField
                          control={form.control}
                          name="triggerDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date d'échéance</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
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
                                    onSelect={field.onChange}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="hours" className="mt-2">
                        <FormField
                          control={form.control}
                          name="triggerHours"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Heures de fonctionnement</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Ex: 500" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                      
                      <TabsContent value="kilometers" className="mt-2">
                        <FormField
                          control={form.control}
                          name="triggerKilometers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Kilométrage</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Ex: 10000" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TabsContent>
                    </Tabs>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex items-start space-x-2">
                <FormField
                  control={form.control}
                  name="isRecurrent"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Maintenance récurrente</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Cochez pour définir un intervalle régulier
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              {isRecurrent && (
                <FormField
                  control={form.control}
                  name="recurrenceInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Intervalle de récurrence 
                        {triggerType === "date" && " (jours)"}
                        {triggerType === "hours" && " (heures)"}
                        {triggerType === "kilometers" && " (km)"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={
                            triggerType === "date" ? "Ex: 180" : 
                            triggerType === "hours" ? "Ex: 500" : 
                            "Ex: 10000"
                          } 
                          {...field} 
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
                  <FormItem>
                    <FormLabel>Commentaire (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Informations supplémentaires concernant cette maintenance" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {status === "completed" && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                    <p className="text-sm font-medium text-amber-800">
                      Cette maintenance sera enregistrée comme déjà effectuée
                    </p>
                  </div>
                  <p className="mt-1 text-xs text-amber-700">
                    Elle apparaîtra directement dans l'historique des maintenances
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMaintenanceDialog;
