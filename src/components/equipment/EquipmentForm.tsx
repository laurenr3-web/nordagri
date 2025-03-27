
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import AddCategoryDialog from './form/AddCategoryDialog';

// Define the validation schema
const equipmentFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  type: z.string().min(1, {
    message: "Veuillez sélectionner un type",
  }),
  category: z.string().min(1, {
    message: "Veuillez sélectionner une catégorie",
  }),
  manufacturer: z.string().min(1, {
    message: "Le fabricant est requis",
  }),
  model: z.string().optional(),
  year: z.string().regex(/^\d{4}$/, {
    message: "L'année doit être au format YYYY",
  }),
  status: z.string().default("operational"),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.date().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

interface EquipmentFormProps {
  onSubmit: (data: EquipmentFormValues) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  initialData?: Partial<EquipmentFormValues>;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData,
}) => {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialData?.purchaseDate
  );

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
      category: initialData?.category || '',
      manufacturer: initialData?.manufacturer || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear().toString(),
      status: initialData?.status || 'operational',
      location: initialData?.location || '',
      serialNumber: initialData?.serialNumber || '',
      purchaseDate: initialData?.purchaseDate,
      notes: initialData?.notes || '',
      image: initialData?.image || 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
    },
  });

  function handleFormSubmit(data: EquipmentFormValues) {
    try {
      console.log('Form values:', data);
      onSubmit(data);
      // Toast will be shown by the parent component after successful API call
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Échec de l'ajout d'équipement", {
        description: "Veuillez réessayer."
      });
    }
  }

  const addNewCategory = (category: string) => {
    setCustomCategories([...customCategories, category]);
    form.setValue('category', category);
  };

  // Options for the dropdowns
  const typeOptions = [
    'Tractor', 
    'Combine', 
    'Sprayer', 
    'Harvester', 
    'Planter', 
    'Tillage', 
    'Other'
  ];
  
  const categoryOptions = [
    'Heavy Equipment', 
    'Medium Equipment', 
    'Light Equipment', 
    'Harvesting Equipment', 
    'Planting Equipment',
    ...customCategories
  ];

  const statusOptions = [
    { value: 'operational', label: 'Opérationnel' },
    { value: 'maintenance', label: 'En maintenance' },
    { value: 'repair', label: 'En réparation' },
    { value: 'retired', label: 'Retiré' },
  ];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom de l'équipement*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Deere 8R 410" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {typeOptions.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex justify-between">
                      <span>Catégorie*</span>
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-xs"
                        onClick={() => setIsAddCategoryDialogOpen(true)}
                      >
                        + Ajouter une catégorie
                      </Button>
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
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
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fabricant*</FormLabel>
                    <FormControl>
                      <Input placeholder="John Deere" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modèle</FormLabel>
                    <FormControl>
                      <Input placeholder="8R 410" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Année*</FormLabel>
                    <FormControl>
                      <Input placeholder="2023" {...field} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emplacement</FormLabel>
                    <FormControl>
                      <Input placeholder="Champ Nord" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de série</FormLabel>
                    <FormControl>
                      <Input placeholder="JD8R410-2022-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'achat</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
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
                          onSelect={(date) => {
                            field.onChange(date);
                            setSelectedDate(date);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date('2000-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL de l'image</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/image.jpg" {...field} />
                </FormControl>
                <FormDescription>
                  Entrez l'URL d'une image pour cet équipement
                </FormDescription>
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
                    placeholder="Informations supplémentaires sur l'équipement..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
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

      <AddCategoryDialog 
        isOpen={isAddCategoryDialogOpen} 
        onOpenChange={setIsAddCategoryDialogOpen} 
        onAddCategory={addNewCategory} 
      />
    </>
  );
};

export default EquipmentForm;
