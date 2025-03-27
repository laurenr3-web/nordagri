
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
} from '@/components/ui/form';
import { Part } from '@/types/Part';
import BasicInfoFields from './form/BasicInfoFields';
import InventoryFields from './form/InventoryFields';
import CompatibilityField from './form/CompatibilityField';
import ImageField from './form/ImageField';
import FormActions from './form/FormActions';
import { PartFormValues } from './form/editPartFormTypes';

interface EditPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part;
  onSubmit: (updatedPart: Part) => void;
}

const EditPartDialog: React.FC<EditPartDialogProps> = ({
  isOpen,
  onOpenChange,
  part,
  onSubmit,
}) => {
  const form = useForm<PartFormValues>({
    defaultValues: {
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      compatibility: part.compatibility.join(', '),
      manufacturer: part.manufacturer,
      price: part.price.toString(),
      stock: part.stock.toString(),
      location: part.location,
      reorderPoint: part.reorderPoint.toString(),
      image: part.image,
    },
  });

  // Réinitialiser le formulaire quand la pièce change ou quand la boîte de dialogue s'ouvre
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: part.name,
        partNumber: part.partNumber,
        category: part.category,
        compatibility: part.compatibility.join(', '),
        manufacturer: part.manufacturer,
        price: part.price.toString(),
        stock: part.stock.toString(),
        location: part.location,
        reorderPoint: part.reorderPoint.toString(),
        image: part.image,
      });
    }
  }, [isOpen, part, form]);

  const handleSubmit = (values: PartFormValues) => {
    console.log('Valeurs soumises:', values);
    
    const updatedPart: Part = {
      ...part,
      name: values.name,
      partNumber: values.partNumber,
      category: values.category,
      compatibility: values.compatibility.split(',').map(item => item.trim()).filter(Boolean),
      manufacturer: values.manufacturer,
      price: parseFloat(values.price) || 0,
      stock: parseInt(values.stock) || 0,
      location: values.location,
      reorderPoint: parseInt(values.reorderPoint) || 5,
      image: values.image,
    };
    
    console.log('Pièce mise à jour:', updatedPart);
    onSubmit(updatedPart);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier la pièce</DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette pièce. Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <BasicInfoFields form={form} />
            <InventoryFields form={form} />
            <CompatibilityField form={form} />
            <ImageField form={form} />
            <FormActions onCancel={() => onOpenChange(false)} isSubmitting={form.formState.isSubmitting} />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartDialog;
