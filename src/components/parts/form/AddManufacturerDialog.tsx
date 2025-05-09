import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useManufacturers } from '@/hooks/parts/useManufacturers';
import { Loader2 } from 'lucide-react';

const manufacturerSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50, 'Le nom est trop long (50 caractères max)'),
  website: z.string().url('Adresse web invalide').or(z.string().length(0)).optional(),
});

type ManufacturerFormValues = z.infer<typeof manufacturerSchema>;

interface AddManufacturerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectManufacturer?: (manufacturer: string) => void;
}

const AddManufacturerDialog: React.FC<AddManufacturerDialogProps> = ({
  isOpen,
  onOpenChange,
  onSelectManufacturer
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addManufacturer } = useManufacturers();
  
  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerSchema),
    defaultValues: {
      name: '',
      website: '',
    }
  });
  
  const onSubmit = async (values: ManufacturerFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Add the new manufacturer - use just the name as that's what the function expects
      const newManufacturer = await addManufacturer(values.name);
      
      // Reset the form
      form.reset();
      
      // Select the new manufacturer if the function is provided
      if (onSelectManufacturer && newManufacturer) {
        onSelectManufacturer(newManufacturer.name);
      }
      
      // Close the dialog
      onOpenChange(false);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fabricant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un fabricant</DialogTitle>
          <DialogDescription>
            Créez un nouveau fabricant pour vos pièces.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du fabricant*</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: John Deere, Kubota..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site web (optionnel)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="https://example.com" />
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

export default AddManufacturerDialog;
