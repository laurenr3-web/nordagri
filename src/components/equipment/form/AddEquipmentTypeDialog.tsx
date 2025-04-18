
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { createEquipmentType } from '@/services/supabase/equipment/types';
import { toast } from 'sonner';

const formSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères")
});

interface AddEquipmentTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (name: string) => void;
}

export function AddEquipmentTypeDialog({ open, onOpenChange, onSuccess }: AddEquipmentTypeDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' }
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createEquipmentType(values.name);
      form.reset();
      onSuccess(values.name);
      onOpenChange(false);
      toast.success("Type d'équipement ajouté");
    } catch (error) {
      console.error('Error creating equipment type:', error);
      toast.error("Erreur lors de la création du type d'équipement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau type d'équipement</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Entrez le nom du type..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  "Ajouter"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
