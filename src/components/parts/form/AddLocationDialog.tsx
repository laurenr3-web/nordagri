
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStorageLocations } from '@/hooks/parts/useStorageLocations';
import { Loader2 } from 'lucide-react';

const locationSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom est trop long (50 caractères max)'),
  description: z.string().max(200, 'La description est trop longue (200 caractères max)').optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

interface AddLocationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLocation?: (location: string) => void;
}

const AddLocationDialog: React.FC<AddLocationDialogProps> = ({
  isOpen,
  onOpenChange,
  onSelectLocation
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addLocation } = useStorageLocations();
  
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });
  
  const onSubmit = async (values: LocationFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Ajouter le nouvel emplacement
      const newLocation = await addLocation({
        name: values.name,
        description: values.description || '',
      });
      
      // Réinitialiser le formulaire
      form.reset();
      
      // Sélectionner le nouvel emplacement si la fonction est fournie
      if (onSelectLocation && newLocation) {
        onSelectLocation(newLocation.name);
      }
      
      // Fermer la boîte de dialogue
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'emplacement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un emplacement</DialogTitle>
          <DialogDescription>
            Créez un nouvel emplacement pour stocker vos pièces.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l'emplacement*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Entrepôt C, Étagère 3..." />
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
                  <FormLabel>Description (optionnelle)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Description ou informations supplémentaires..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
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
                  'Ajouter'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationDialog;
