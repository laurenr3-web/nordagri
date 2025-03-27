
import React from 'react';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Part } from '@/types/Part';
import BasicInfoFields from './BasicInfoFields';
import InventoryFields from './InventoryFields';
import CompatibilityField from './CompatibilityField';
import ImageField from './ImageField';
import FormActions from './FormActions';
import { partFormSchema, PartFormValues } from './editPartFormTypes';
import { zodResolver } from '@hookform/resolvers/zod';

interface EditPartFormProps {
  part: Part;
  onSubmit: (updatedPart: Part) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EditPartForm: React.FC<EditPartFormProps> = ({
  part,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
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
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <InventoryFields form={form} />
        <CompatibilityField form={form} />
        <ImageField form={form} />
        <FormActions onCancel={onCancel} isSubmitting={isSubmitting} />
      </form>
    </Form>
  );
};

export default EditPartForm;
