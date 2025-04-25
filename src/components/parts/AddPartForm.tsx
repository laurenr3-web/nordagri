
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { PartFormValues, AddPartFormProps } from './form/partFormTypes';
import BasicInfoFields from './form/fields/BasicInfoFields';
import InventoryFields from './form/fields/InventoryFields';
import CompatibilityField from './form/fields/CompatibilityField';
import ImageField from './form/fields/ImageField';
import AddCategoryDialog from './form/AddCategoryDialog';
import { useCreatePart } from '@/hooks/parts';
import { Part } from '@/types/Part';
import EquipmentCompatibilityField from './form/fields/EquipmentCompatibilityField';

// Extended schema with equipment compatibility
const partFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  partNumber: z.string().min(1, "La référence est requise"),
  category: z.string().min(1, "La catégorie est requise"),
  manufacturer: z.string().min(1, "Le fabricant est requis"),
  price: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Le prix doit être un nombre valide",
  }),
  stock: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Le stock doit être un nombre entier valide",
  }),
  location: z.string().optional(),
  reorderPoint: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Le point de réapprovisionnement doit être un nombre valide",
  }),
  compatibility: z.string().optional(),
  compatibleEquipment: z.array(z.string()).optional(),
  image: z.string().url({ message: "Veuillez fournir une URL valide pour l'image" }).optional().or(z.literal('')),
});

type ExtendedPartFormValues = z.infer<typeof partFormSchema>;

export function AddPartForm({ onSuccess, onCancel }: AddPartFormProps) {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddManufacturerDialogOpen, setIsAddManufacturerDialogOpen] = useState(false);
  const [isAddLocationDialogOpen, setIsAddLocationDialogOpen] = useState(false);
  const createPartMutation = useCreatePart();
  
  const form = useForm<ExtendedPartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: '',
      partNumber: '',
      category: '',
      manufacturer: '',
      price: '',
      stock: '',
      reorderPoint: '',
      location: 'Warehouse A',
      compatibility: '',
      compatibleEquipment: [],
      image: ''
    }
  });

  // Surveiller les changements de valeur dans le champ fabricant
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'manufacturer' && value.manufacturer === '__add_new__') {
        form.setValue('manufacturer', ''); // Reset to empty
        setIsAddManufacturerDialogOpen(true);
      } else if (name === 'location' && value.location === '__add_new__') {
        form.setValue('location', ''); // Reset to empty
        setIsAddLocationDialogOpen(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      setCustomCategories([...customCategories, newCategory.trim()]);
      form.setValue('category', newCategory.trim());
      setNewCategory('');
      setIsAddCategoryDialogOpen(false);
      toast.success(`Category "${newCategory.trim()}" added successfully`);
    }
  };

  function onSubmit(data: ExtendedPartFormValues) {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring duplicate attempt');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Combiner les textes de compatibilité et les IDs d'équipement
      const textualCompatibility = data.compatibility 
        ? data.compatibility.split(',').map(item => item.trim()).filter(Boolean) 
        : [];
      
      const combinedCompatibility = [
        ...textualCompatibility,
        ...(data.compatibleEquipment || [])
      ];
      
      // Convert form values to Part format (without id) for the API
      const partData: Omit<Part, 'id'> = {
        name: data.name,
        partNumber: data.partNumber,
        category: data.category,
        manufacturer: data.manufacturer,
        compatibility: combinedCompatibility,
        stock: parseInt(data.stock) || 0,
        price: parseFloat(data.price) || 0,
        reorderPoint: parseInt(data.reorderPoint) || 5,
        location: data.location,
        image: data.image
      };
      
      // Use the mutation hook to save the part
      createPartMutation.mutate(partData, {
        onSuccess: () => {
          toast.success(`Pièce "${data.name}" ajoutée avec succès`);
          if (onSuccess) {
            onSuccess(data as any);
          }
          setIsSubmitting(false);
        },
        onError: (error) => {
          console.error('Error adding part:', error);
          toast.error('Erreur lors de l\'ajout de la pièce');
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      // Error handling is managed by the mutation hook
      console.error(error);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <BasicInfoFields 
                form={form} 
                customCategories={customCategories}
                onAddCategoryClick={() => setIsAddCategoryDialogOpen(true)}
              />
              <InventoryFields form={form} />

              {/* Nouveau champ pour la compatibilité avec les équipements */}
              <EquipmentCompatibilityField form={form} />

              <CompatibilityField form={form} />
            </div>
            <ImageField form={form} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createPartMutation.isPending}
            >
              {isSubmitting || createPartMutation.isPending ? 'Ajout en cours...' : 'Ajouter la pièce'}
            </Button>
          </div>
        </form>
      </Form>

      <AddCategoryDialog 
        isOpen={isAddCategoryDialogOpen}
        onOpenChange={setIsAddCategoryDialogOpen}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        onAddCategory={addNewCategory}
      />
    </>
  );
}

export { type PartFormValues } from './form/partFormTypes';
