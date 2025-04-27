
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePart } from '@/hooks/parts';
import { Part } from '@/types/Part';

// Schéma de validation Zod pour les pièces
const partSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  partNumber: z.string().min(1, "La référence est requise"),
  description: z.string().optional(),
  category: z.string().optional().default('Général'),
  manufacturer: z.string().optional().default(''),
  compatibility: z.string().optional().default(''),
  inStock: z.boolean().default(true),
  stock: z.coerce.number().min(0).default(0),
  reorderPoint: z.coerce.number().min(0).default(5),
  location: z.string().optional().default(''),
  price: z.coerce.number().min(0).optional()
});

type PartFormValues = z.infer<typeof partSchema>;

interface NewPartFormProps {
  onSuccess?: (part: Part) => void;
  onCancel?: () => void;
}

export function NewPartForm({ onSuccess, onCancel }: NewPartFormProps) {
  const createPartMutation = useCreatePart();
  
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      partNumber: '',
      description: '',
      category: 'Général',
      manufacturer: '',
      compatibility: '',
      inStock: true,
      stock: 0,
      reorderPoint: 5,
      location: '',
      price: undefined
    }
  });

  const onSubmit = async (values: PartFormValues) => {
    console.log("Soumission du formulaire avec:", values);
    try {
      // Convertir la chaîne de compatibilité en tableau de nombres
      const compatibilityArray = values.compatibility 
        ? values.compatibility.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
        : [];
      
      // Transformez les valeurs pour correspondre à l'interface Part
      const partData: Omit<Part, 'id'> = {
        name: values.name,
        partNumber: values.partNumber,
        reference: values.partNumber, // Pour la rétrocompatibilité
        category: values.category || 'Général',
        manufacturer: values.manufacturer || '',
        compatibility: compatibilityArray, // Tableau d'IDs numériques
        compatibleWith: values.compatibility ? values.compatibility.split(',').map(item => item.trim()) : [],
        stock: values.stock,
        quantity: values.stock, // Pour la rétrocompatibilité
        price: values.price || 0,
        location: values.location || '',
        reorderPoint: values.reorderPoint,
        minimumStock: values.reorderPoint, // Pour la rétrocompatibilité
        image: 'https://placehold.co/100x100/png' // Image par défaut
      };
      
      createPartMutation.mutate(partData, {
        onSuccess: (result) => {
          if (onSuccess) {
            onSuccess(result);
          }
        }
      });
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  const isSubmitting = form.formState.isSubmitting || createPartMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom*</FormLabel>
                <FormControl>
                  <Input placeholder="Nom de la pièce" {...field} />
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
                <FormLabel>Référence*</FormLabel>
                <FormControl>
                  <Input placeholder="Référence unique" {...field} />
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
                <FormLabel>Catégorie</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Général">Général</SelectItem>
                    <SelectItem value="Moteur">Moteur</SelectItem>
                    <SelectItem value="Transmission">Transmission</SelectItem>
                    <SelectItem value="Hydraulique">Hydraulique</SelectItem>
                    <SelectItem value="Électrique">Électrique</SelectItem>
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
                <FormLabel>Fabricant</FormLabel>
                <FormControl>
                  <Input placeholder="Nom du fabricant" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="compatibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compatibilité (IDs numériques)</FormLabel>
                <FormControl>
                  <Input placeholder="IDs des équipements séparés par des virgules (1, 2, 3)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Description détaillée" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="inStock"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>En stock</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantité en stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
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
                <FormLabel>Seuil de réapprovisionnement</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
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
                  <Input placeholder="Étagère, entrepôt..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix unitaire (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
