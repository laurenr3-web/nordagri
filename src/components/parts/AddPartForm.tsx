
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { PartFormValues, AddPartFormProps } from './form/partFormTypes';
import BasicInfoFields from './form/fields/BasicInfoFields';
import InventoryInfoFields from './form/fields/InventoryInfoFields';
import CompatibilityField from './form/fields/CompatibilityField';
import ImageField from './form/fields/ImageField';
import AddCategoryDialog from './form/AddCategoryDialog';
import { useCreatePart } from '@/hooks/parts';
import { Part } from '@/types/Part';

export function AddPartForm({ onSuccess, onCancel }: AddPartFormProps) {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createPartMutation = useCreatePart();
  
  const form = useForm<PartFormValues>({
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
      image: ''
    }
  });

  const addNewCategory = () => {
    if (newCategory.trim() !== '') {
      setCustomCategories([...customCategories, newCategory.trim()]);
      form.setValue('category', newCategory.trim());
      setNewCategory('');
      setIsAddCategoryDialogOpen(false);
      toast.success(`Category "${newCategory.trim()}" added successfully`);
    }
  };

  function onSubmit(data: PartFormValues) {
    // Prevent multiple submissions
    if (isSubmitting) {
      console.log('Submission already in progress, ignoring duplicate attempt');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Convert form values to Part format (without id) for the API
      const partData: Omit<Part, 'id'> = {
        name: data.name,
        partNumber: data.partNumber,
        category: data.category,
        manufacturer: data.manufacturer,
        compatibility: data.compatibility ? data.compatibility.split(',').map(item => item.trim()) : [],
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
            onSuccess(data);
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
            <BasicInfoFields 
              form={form} 
              customCategories={customCategories}
              onAddCategoryClick={() => setIsAddCategoryDialogOpen(true)}
            />
            <InventoryInfoFields form={form} />
            <ImageField form={form} />
          </div>

          <CompatibilityField form={form} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || createPartMutation.isPending}
            >
              {isSubmitting || createPartMutation.isPending ? 'Adding...' : 'Add Part'}
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
