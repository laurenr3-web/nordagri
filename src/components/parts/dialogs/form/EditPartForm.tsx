import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Part } from '@/types/Part';
import { Loader2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { updatePart } from '@/services/supabase/parts';
import ImagePreview from '@/components/equipment/form/fields/ImagePreview';
import CameraCapture from '@/components/equipment/form/CameraCapture';

// Définition du schéma de validation
const partFormSchema = z.object({
  name: z.string().min(2, {
    message: "Le nom doit contenir au moins 2 caractères",
  }),
  partNumber: z.string().min(1, {
    message: "Le numéro de pièce est requis",
  }),
  category: z.string().min(1, {
    message: "La catégorie est requise",
  }),
  manufacturer: z.string().min(1, {
    message: "Le fabricant est requis",
  }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Le prix doit être un nombre valide",
  }),
  stock: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Le stock doit être un nombre entier valide",
  }),
  location: z.string().optional(),
  reorderPoint: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Le point de réapprovisionnement doit être un nombre valide",
  }),
  compatibility: z.string().optional(),
  image: z.string().url({
    message: "Veuillez fournir une URL valide pour l'image",
  }).optional().or(z.literal('')),
});

type PartFormValues = z.infer<typeof partFormSchema>;

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
  isSubmitting: externalSubmitting = false 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = isSubmitting || externalSubmitting;

  // Conversion des valeurs pour le formulaire
  const defaultValues: PartFormValues = {
    name: part.name,
    partNumber: part.partNumber,
    category: part.category,
    manufacturer: part.manufacturer,
    price: part.price.toString(),
    stock: part.stock.toString(),
    location: part.location,
    reorderPoint: part.reorderPoint.toString(),
    compatibility: part.compatibility.join(', '),
    image: part.image,
  };

  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues,
  });

  const handleSubmit = async (data: PartFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convertir les valeurs du formulaire au format de la pièce
      const updatedPart: Part = {
        ...part,
        name: data.name,
        partNumber: data.partNumber,
        category: data.category,
        manufacturer: data.manufacturer,
        price: parseFloat(data.price),
        stock: parseInt(data.stock),
        location: data.location || '',
        reorderPoint: parseInt(data.reorderPoint),
        compatibility: data.compatibility 
          ? data.compatibility.split(',').map(item => item.trim()).filter(Boolean)
          : [],
        image: data.image || '',
      };
      
      console.log('Mise à jour de la pièce:', updatedPart);
      
      // Appeler le service pour mettre à jour la pièce
      const result = await updatePart(updatedPart);
      
      console.log('Pièce mise à jour avec succès:', result);
      
      toast.success('Pièce mise à jour avec succès');
      
      onSubmit(result);
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour de la pièce:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour la pièce'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Options pour les catégories prédéfinies
  const categoryOptions = [
    'Moteur',
    'Transmission',
    'Hydraulique',
    'Électrique',
    'Filtration',
    'Pneumatique',
    'Divers',
    // Ajouter la catégorie actuelle si elle n'est pas dans la liste
    ...(part.category && !['Moteur', 'Transmission', 'Hydraulique', 'Électrique', 'Filtration', 'Pneumatique', 'Divers'].includes(part.category) 
      ? [part.category] 
      : [])
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de la pièce*</FormLabel>
                  <FormControl>
                    <Input placeholder="Filtre à huile" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="partNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro de pièce*</FormLabel>
                  <FormControl>
                    <Input placeholder="ABC-123456" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catégorie*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="manufacturer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricant*</FormLabel>
                  <FormControl>
                    <Input placeholder="John Deere" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Informations d'inventaire */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prix unitaire*</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="59.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité en stock*</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Point de réapprovisionnement*</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" placeholder="5" {...field} />
                  </FormControl>
                  <FormDescription>
                    Quantité minimale avant réapprovisionnement
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emplacement</FormLabel>
                  <FormControl>
                    <Input placeholder="Étagère A-12" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="compatibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Compatibilité</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="JD 8R, JD 9R, Case IH Magnum (séparés par des virgules)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Lister les modèles d'équipements compatibles, séparés par des virgules
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL de l'image</FormLabel>
              <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2">
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  
                  <CameraCapture 
                    onCapture={(imageDataUrl) => {
                      form.setValue('image', imageDataUrl);
                    }} 
                  />
                </div>
                
                <ImagePreview 
                  imageUrl={field.value}
                  onReset={() => form.setValue('image', '')}
                  altText={`Aperçu de ${part.name}`}
                />
                
                <FormDescription>
                  URL d'une image pour cette pièce (facultatif)
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditPartForm;
