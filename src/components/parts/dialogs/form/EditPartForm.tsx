
import React, { useState } from 'react';
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
import BasicInfoFields from '@/components/parts/form/fields/BasicInfoFields';
import InventoryFields from '@/components/parts/form/fields/InventoryFields';
import CompatibilityField from '@/components/parts/form/fields/CompatibilityField';
import FormActions from '@/components/parts/form/FormActions';
import ImageField from '@/components/parts/form/fields/ImageField';
import { partFormSchema } from '@/components/parts/form/partFormTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useUpdatePart } from '@/hooks/parts/useUpdatePart';

interface EditPartFormProps {
  part: Part;
  onSubmit: (part: Part) => void;
  onCancel: () => void;
  onMainDialogClose?: () => void;
}

const EditPartForm: React.FC<EditPartFormProps> = ({ 
  part, 
  onSubmit, 
  onCancel,
  onMainDialogClose 
}) => {
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const updatePartMutation = useUpdatePart();
  
  // Initialiser le formulaire avec les valeurs de la pièce existante
  const form = useForm<z.infer<typeof partFormSchema>>({
    resolver: zodResolver(partFormSchema),
    defaultValues: {
      name: part.name,
      partNumber: part.partNumber || part.reference || '',
      category: part.category,
      manufacturer: part.manufacturer,
      price: part.price?.toString() || '0',
      stock: part.stock?.toString() || '0',
      reorderPoint: part.reorderPoint?.toString() || '5',
      location: part.location || '',
      compatibility: Array.isArray(part.compatibility) ? part.compatibility.join(', ') : 
                     Array.isArray(part.compatibleWith) ? part.compatibleWith.join(', ') : '',
      image: part.image || 'https://placehold.co/100x100/png'
    },
  });

  console.log('Form initialized with values:', form.getValues());

  // Gérer la soumission du formulaire
  const handleSubmit = async (values: z.infer<typeof partFormSchema>) => {
    console.log('Form submitted with values:', values);
    setSubmissionError(null); // Reset previous error
    
    try {
      // Convertir les chaînes en nombres pour les champs numériques
      const price = parseFloat(values.price) || 0;
      const stock = parseInt(values.stock) || 0;
      const reorderPoint = parseInt(values.reorderPoint) || 5;
      
      // Convertir la chaîne de compatibilité en tableau
      const compatibility = values.compatibility
        ? values.compatibility.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      // Validation locale des données avant envoi
      if (!values.name.trim()) {
        setSubmissionError("Le nom de la pièce est obligatoire");
        return;
      }
      
      const updatedPart: Part = {
        ...part, // Conserver l'ID et autres propriétés inchangées
        name: values.name,
        partNumber: values.partNumber,
        reference: values.partNumber, // Pour assurer la compatibilité avec le composant de détail
        category: values.category,
        manufacturer: values.manufacturer,
        price: price,
        stock: stock,
        quantity: stock, // Pour assurer la compatibilité avec le composant de détail
        reorderPoint: reorderPoint,
        minimumStock: reorderPoint, // Pour assurer la compatibilité avec le composant de détail
        location: values.location,
        compatibility: compatibility,
        compatibleWith: compatibility, // Pour assurer la compatibilité avec le composant de détail
        image: values.image || part.image // Conserver l'image existante si aucune nouvelle n'est fournie
      };
      
      console.log('Sending updated part to parent:', updatedPart);
      
      // Attendre explicitement que la mise à jour soit terminée
      await updatePartMutation.mutateAsync(updatedPart);
      
      // IMPORTANT: Fermer d'abord le dialogue d'édition
      onSubmit(updatedPart);
      
      // PUIS fermer le dialogue principal après un court délai
      if (onMainDialogClose) {
        setTimeout(() => {
          onMainDialogClose();
        }, 300);
      }
      
    } catch (error: any) {
      console.error('Error processing form submission:', error);
      // Message d'erreur plus détaillé et plus convivial
      let errorMessage = error.message || 'Une erreur est survenue lors de la mise à jour de la pièce.';
      
      // Formatage spécifique des messages d'erreur pour une meilleure lisibilité
      if (errorMessage.includes('Référence de pièce en doublon')) {
        errorMessage = `Cette référence de pièce (${form.getValues().partNumber}) est déjà utilisée. Veuillez en choisir une autre.`;
      } else if (errorMessage.includes('Champs obligatoires manquants')) {
        errorMessage = 'Veuillez remplir tous les champs obligatoires marqués d\'un astérisque (*).';
      } else if (errorMessage.includes('Permissions insuffisantes')) {
        errorMessage = 'Vous n\'avez pas les droits nécessaires pour modifier cette pièce. Veuillez contacter votre administrateur.';
      }
      
      setSubmissionError(errorMessage);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" aria-label="Formulaire de modification de pièce">
        {submissionError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur de mise à jour</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <BasicInfoFields form={form} />
            <InventoryFields form={form} />
            <CompatibilityField form={form} />
          </div>
          <ImageField form={form} />
        </div>
        <FormActions 
          onCancel={onCancel} 
          isSubmitting={form.formState.isSubmitting || updatePartMutation.isPending}
          isError={!!submissionError}
        />
      </form>
    </Form>
  );
};

export default EditPartForm;
