
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
  // Initialiser le formulaire avec les valeurs de la pièce existante
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
      compatibility: Array.isArray(part.compatibility) ? part.compatibility.join(', ') : '', // Sécuriser la conversion array → string
      image: part.image
    },
  });

  console.log('Form initialized with values:', form.getValues());

  // Gérer la soumission du formulaire
  const handleSubmit = (values: z.infer<typeof partFormSchema>) => {
    console.log('Form submitted with values:', values);
    
    // Convertir les chaînes en nombres pour les champs numériques
    const price = parseFloat(values.price);
    const stock = parseInt(values.stock);
    const reorderPoint = parseInt(values.reorderPoint);
    
    // Vérifier que les conversions sont valides
    if (isNaN(price) || isNaN(stock) || isNaN(reorderPoint)) {
      console.error('Invalid number conversions:', { price, stock, reorderPoint });
      return;
    }
    
    // Convertir la chaîne de compatibilité en tableau
    const compatibility = values.compatibility
      ? values.compatibility.split(',').map(item => item.trim()).filter(Boolean)
      : [];
    
    const updatedPart: Part = {
      ...part, // Conserver l'ID et autres propriétés inchangées
      name: values.name,
      partNumber: values.partNumber,
      category: values.category,
      manufacturer: values.manufacturer,
      price: price,
      stock: stock,
      reorderPoint: reorderPoint,
      location: values.location,
      compatibility: compatibility,
      image: values.image || part.image // Conserver l'image existante si aucune nouvelle n'est fournie
    };
    
    console.log('Sending updated part to parent:', updatedPart);
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
