
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';
import { equipmentFormSchema, EquipmentFormProps, EquipmentFormValues } from './form/equipmentFormTypes';
import BasicInfoFields from './form/BasicInfoFields';
import AdditionalInfoFields from './form/AdditionalInfoFields';
import ImageField from './form/ImageField';
import NotesField from './form/NotesField';
import AddCategoryDialog from './form/AddCategoryDialog';

const EquipmentForm: React.FC<EquipmentFormProps> = ({ onSubmit, onCancel }) => {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: '',
      type: '',
      category: '',
      manufacturer: '',
      model: '',
      year: new Date().getFullYear().toString(),
      serialNumber: '',
      status: 'operational',
      location: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
      image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?q=80&w=500&auto=format&fit=crop',
    },
  });

  const handleSubmit = (data: EquipmentFormValues) => {
    try {
      onSubmit(data);
      toast.success("Equipment added successfully.", {
        description: `${data.name} has been added successfully.`
      });
    } catch (error) {
      toast.error("Failed to add equipment", {
        description: "Please try again."
      });
    }
  };

  const addNewCategory = (category: string) => {
    setCustomCategories([...customCategories, category]);
    form.setValue('category', category);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <BasicInfoFields 
              form={form} 
              customCategories={customCategories} 
              onAddCategoryClick={() => setIsAddCategoryDialogOpen(true)} 
            />
            <AdditionalInfoFields form={form} />
            <ImageField form={form} />
          </div>

          <NotesField form={form} />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Equipment</Button>
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
