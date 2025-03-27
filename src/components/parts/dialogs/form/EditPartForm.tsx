
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Part } from '@/types/Part';
import BasicInfoFields from './BasicInfoFields';
import InventoryFields from './InventoryFields';
import CompatibilityField from './CompatibilityField';
import FormActions from './FormActions';
import ImageField from './ImageField';
import { partFormSchema } from './editPartFormTypes';

interface EditPartFormProps {
  part: Part;
  onSubmit: (part: Part) => void;
  onCancel: () => void;
}

const EditPartForm: React.FC<EditPartFormProps> = ({ part, onSubmit, onCancel }) => {
  const form = useForm<z.infer<typeof partFormSchema>>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: part.name,
      partNumber: part.partNumber,
      category: part.category,
      manufacturer: part.manufacturer,
      price: part.price.toString(),
      stock: part.stock.toString(),
      reorderPoint: part.reorderPoint.toString(),
      location: part.location,
      compatibility: part.compatibility.join(', '), // Convert array to comma-separated string
      image: part.image
    },
  });

  const handleSubmit = (values: z.infer<typeof partFormSchema>) => {
    const updatedPart: Part = {
      ...part,
      name: values.name,
      partNumber: values.partNumber,
      category: values.category,
      manufacturer: values.manufacturer,
      price: parseFloat(values.price),
      stock: parseInt(values.stock),
      reorderPoint: parseInt(values.reorderPoint),
      location: values.location,
      compatibility: values.compatibility.split(',').map(item => item.trim()).filter(item => item), // Convert back to array and remove empty items
      image: values.image
    };
    onSubmit(updatedPart);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" aria-label="Formulaire de modification de pièce">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <BasicInfoFields form={form} />
            <InventoryFields form={form} />
            <CompatibilityField form={form} />
          </div>
          <ImageField form={form} />
        </div>
        <FormActions onCancel={onCancel} isSubmitting={form.formState.isSubmitting} />
      </form>
    </Form>
  );
};

export default EditPartForm;
