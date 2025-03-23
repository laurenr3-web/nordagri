
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

export function AddPartForm({ onSuccess, onCancel }: AddPartFormProps) {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  
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
      image: 'https://images.unsplash.com/photo-1642742381109-81e94659e783?q=80&w=500&auto=format&fit=crop'
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
    try {
      // Here you would typically send this data to a backend API
      // For now we'll just simulate success
      toast.success('Part added successfully');
      
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      toast.error('Failed to add part');
      console.error(error);
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
            <Button type="submit">
              Add Part
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
