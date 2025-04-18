
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import BasicInfoFields from '../form/BasicInfoFields';
import AdditionalInfoFields from '../form/AdditionalInfoFields';
import ImageField from '../form/ImageField';
import NotesField from '../form/NotesField';
import AddCategorySection from './form/AddCategorySection';
import { equipmentFormSchema, type EquipmentFormValues, type EquipmentStatus } from '../form/equipmentFormTypes';
import { Form } from '@/components/ui/form';
import { createEquipmentType } from '@/services/supabase/equipment/types';

interface EditEquipmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  equipment: any;
  onSubmit: (data: any) => void;
}

const EditEquipmentDialog: React.FC<EditEquipmentDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  equipment, 
  onSubmit 
}) => {
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Format equipment data for the form, ensuring purchaseDate is properly formatted
  const defaultValues: EquipmentFormValues = {
    name: equipment.name,
    type: equipment.type,
    manufacturer: equipment.manufacturer,
    model: equipment.model,
    year: equipment.year.toString(),
    serialNumber: equipment.serialNumber || '',
    status: equipment.status as EquipmentStatus,
    location: equipment.location,
    purchaseDate: equipment.purchaseDate ? new Date(equipment.purchaseDate) : undefined,
    notes: equipment.notes || '',
    image: equipment.image,
  };

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: EquipmentFormValues) => {
    try {
      // Convert form data back to equipment object format
      const updatedEquipment = {
        ...equipment,
        name: data.name,
        type: data.type,
        manufacturer: data.manufacturer,
        model: data.model,
        year: parseInt(data.year || '0'),
        serialNumber: data.serialNumber,
        status: data.status,
        location: data.location,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
        image: data.image,
      };
      
      onSubmit(updatedEquipment);
      onOpenChange(false);  // Close the dialog after submission
      toast.success('Equipment updated successfully');
    } catch (error) {
      console.error('Error updating equipment:', error);
      toast.error('Failed to update equipment');
    }
  };

  const addNewCategory = async (category: string) => {
    try {
      const newType = await createEquipmentType(category);
      if (newType && newType.name) {
        setCustomCategories([...customCategories, newType.name]);
        form.setValue('type', newType.name);
        toast.success(`Type "${newType.name}" added successfully`);
        return newType;
      } else {
        throw new Error("Failed to create new type");
      }
    } catch (error) {
      console.error('Error adding new category:', error);
      toast.error('Failed to add new equipment type');
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Equipment</DialogTitle>
          <DialogDescription>
            Update the information for this equipment
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BasicInfoFields 
                form={form}
                customCategories={customCategories}
                onAddCategoryClick={() => setIsAddCategoryDialogOpen(true)}
                language="en"
                onAddCustomType={addNewCategory}
              />
              
              <AdditionalInfoFields 
                form={form}
                language="en"
              />
            </div>

            <ImageField form={form} />
            <NotesField form={form} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Equipment</Button>
            </DialogFooter>
          </form>
        </Form>

        <AddCategorySection
          isOpen={isAddCategoryDialogOpen}
          onOpenChange={setIsAddCategoryDialogOpen}
          onAddCategory={addNewCategory}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditEquipmentDialog;
