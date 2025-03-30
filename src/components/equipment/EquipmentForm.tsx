
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { toast } from 'sonner';

// Import refactored components
import { equipmentFormSchema, type EquipmentFormValues } from './form/equipmentFormTypes';
import AddCategoryDialog from './form/AddCategoryDialog';
import BasicInfoFields from './form/BasicInfoFields';
import AdditionalInfoFields from './form/AdditionalInfoFields';
import ImageField from './form/ImageField';
import NotesField from './form/NotesField';

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

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || '',
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
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error("Échec de l'ajout d'équipement", {
        description: "Veuillez réessayer."
      });
    }
  }

  const addNewCategory = (category: string) => {
    setCustomCategories([...customCategories, category]);
    form.setValue('type', category);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <BasicInfoFields 
              form={form} 
              customCategories={customCategories} 
              onAddCategoryClick={() => setIsAddCategoryDialogOpen(true)} 
            />

            {/* Additional Information */}
            <AdditionalInfoFields form={form} />
          </div>

          <ImageField form={form} />
          
          <NotesField form={form} />

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
