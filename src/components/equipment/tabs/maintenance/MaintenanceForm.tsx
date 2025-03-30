
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { MaintenanceTask, MaintenancePriority, MaintenanceType } from '@/hooks/maintenance/maintenanceSlice';
import { Part } from '@/types/Part';

const maintenanceFormSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  type: z.enum(['preventive', 'corrective', 'condition-based']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  dueDate: z.date({
    required_error: "Veuillez sélectionner une date",
  }),
  estimatedDuration: z.coerce.number().min(0.5, 'La durée minimum est de 0.5 heure'),
  notes: z.string().optional(),
  partId: z.string().optional(),
});

type MaintenanceFormValues = z.infer<typeof maintenanceFormSchema>;

interface MaintenanceFormProps {
  equipment: any;
  onSubmit: (values: MaintenanceFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MaintenanceForm: React.FC<MaintenanceFormProps> = ({
  equipment,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [parts, setParts] = useState<Part[]>([]);

  useEffect(() => {
    // Simulation de récupération des pièces compatibles avec cet équipement
    const mockParts: Part[] = [
      {
        id: "P001",
        name: "Filtre à huile",
        partNumber: "FH-JD-8R-001",
        category: "Filtres",
        compatibility: ["John Deere 8R 410"],
        manufacturer: "John Deere",
        price: 35.50,
        stock: 12,
        location: "Rayon A3",
        reorderPoint: 5,
        image: "/placeholder.svg",
      },
      {
        id: "P002",
        name: "Kit courroie distribution",
        partNumber: "KCD-JD-8R-002",
        category: "Transmission",
        compatibility: ["John Deere 8R 410"],
        manufacturer: "John Deere",
        price: 145.99,
        stock: 3,
        location: "Rayon B2",
        reorderPoint: 2,
        image: "/placeholder.svg",
      },
      {
        id: "P003",
        name: "Filtre à carburant",
        partNumber: "FC-JD-8R-003",
        category: "Filtres",
        compatibility: ["John Deere 8R 410"],
        manufacturer: "John Deere",
        price: 29.75,
        stock: 8,
        location: "Rayon A3",
        reorderPoint: 4,
        image: "/placeholder.svg",
      },
    ];

    setParts(mockParts);
  }, []);

  const form = useForm<MaintenanceFormValues>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: '',
      type: 'preventive',
      priority: 'medium',
      dueDate: new Date(),
      estimatedDuration: 1,
      notes: '',
      partId: '',
    },
  });

  const handleSubmit = (values: MaintenanceFormValues) => {
    try {
      onSubmit(values);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error("Échec de la création de maintenance");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre de la maintenance</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Changement de filtres" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <SelectItem value="preventive">Préventive</SelectItem>
                    <SelectItem value="corrective">Corrective</SelectItem>
                    <SelectItem value="condition-based">Conditionnelle</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priorité</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une priorité" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="critical">Critique</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date prévue</FormLabel>
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
                          format(field.value, "dd/MM/yyyy", { locale: fr })
                        ) : (
                          <span>Sélectionner une date</span>
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
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedDuration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée estimée (heures)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.5" min="0.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="partId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pièce concernée</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une pièce (optionnel)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">Aucune pièce spécifique</SelectItem>
                  {parts.map((part) => (
                    <SelectItem key={part.id} value={part.id.toString()}>
                      {part.name} - {part.partNumber}
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
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Détails supplémentaires sur la maintenance à effectuer..." 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Création...' : 'Créer la maintenance'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default MaintenanceForm;
