import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreatePart } from '@/hooks/parts';
import { Part } from '@/types/Part';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

// Schéma de validation minimal
const expressPartSchema = z.object({
  name: z.string().min(1, "Le nom est obligatoire"),
  partNumber: z.string().min(1, "La référence est obligatoire"),
  stock: z.coerce.number().min(0, "La quantité ne peut pas être négative"),
  category: z.string().optional(),
  manufacturer: z.string().optional(),
});

type ExpressPartFormValues = z.infer<typeof expressPartSchema>;

interface ExpressAddPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExpressAddPartDialog: React.FC<ExpressAddPartDialogProps> = ({
  isOpen,
  onOpenChange
}) => {
  const [keepValues, setKeepValues] = useState<boolean>(false);
  const createPartMutation = useCreatePart();
  
  // Default values
  const defaultValues: ExpressPartFormValues = {
    name: '',
    partNumber: '',
    stock: 1,
    category: 'Général',
    manufacturer: '',
  };
  
  const form = useForm<ExpressPartFormValues>({
    resolver: zodResolver(expressPartSchema),
    defaultValues
  });
  
  const onSubmit = async (values: ExpressPartFormValues) => {
    const partData: Omit<Part, 'id'> = {
      name: values.name,
      partNumber: values.partNumber,
      category: values.category || 'Général',
      manufacturer: values.manufacturer || '',
      compatibility: [], // Empty by default
      stock: values.stock,
      price: 0, // Default price
      reorderPoint: 5, // Default reorder point
      location: 'Stock principal', // Default location
      image: 'https://placehold.co/100x100/png?text=Pièce' // Default image
    };
    
    createPartMutation.mutate(partData, {
      onSuccess: (newPart) => {
        toast.success(`Pièce "${newPart.name}" ajoutée`);
        
        if (keepValues) {
          // Reset form but keep category and manufacturer
          form.reset({
            name: '',
            partNumber: '',
            stock: 1,
            category: values.category,
            manufacturer: values.manufacturer,
          });
        } else {
          // Close dialog after adding if not keeping values
          onOpenChange(false);
        }
      },
      onError: (error: any) => {
        toast.error(`Erreur: ${error.message || "Échec de l'ajout"}`);
      }
    });
  };
  
  const handleAddAnother = () => {
    setKeepValues(true);
    form.handleSubmit(onSubmit)();
  };
  
  const handleAddAndClose = () => {
    setKeepValues(false);
    form.handleSubmit(onSubmit)();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajout Express</DialogTitle>
          <DialogDescription>
            Ajoutez rapidement une pièce avec les informations essentielles.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form className="space-y-4">
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
                    <Input placeholder="Référence ou N° de pièce" {...field} />
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
                  <FormLabel>Quantité*</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Catégorie" />
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
                      <Input placeholder="Fabricant" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createPartMutation.isPending}
              >
                Annuler
              </Button>
              
              <div className="space-x-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddAnother}
                  disabled={createPartMutation.isPending}
                >
                  {createPartMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Ajouter un autre
                </Button>
                
                <Button
                  type="button"
                  onClick={handleAddAndClose}
                  disabled={createPartMutation.isPending}
                >
                  {createPartMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Ajouter'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpressAddPartDialog;
