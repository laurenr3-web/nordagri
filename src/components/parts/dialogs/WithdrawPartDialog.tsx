import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Wrench } from 'lucide-react';
import { withdrawPart } from '@/services/supabase/parts/withdrawPart';
import { supabase } from '@/integrations/supabase/client';
import { Part } from '@/types/Part';
import { Combobox } from '@/components/ui/combobox';
import { convertToLocalPart } from '@/utils/partTypeConverters';

// Définition du schéma de validation
const withdrawalFormSchema = z.object({
  part_id: z.number().int().positive({ message: "Veuillez sélectionner une pièce" }),
  quantity: z.number().int().positive({ message: "La quantité doit être positive" }),
  equipment_id: z.number().int().optional(),
  task_id: z.number().int().optional(),
  notes: z.string().optional(),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

interface WithdrawPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function WithdrawPartDialog({ isOpen, onOpenChange, onSuccess }: WithdrawPartDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);
  const [equipment, setEquipment] = useState<{value: string, label: string}[]>([]);
  const [tasks, setTasks] = useState<{value: string, label: string}[]>([]);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [loadingParts, setLoadingParts] = useState(true);

  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      quantity: 1,
      notes: '',
    },
  });

  // Charger les pièces disponibles
  useEffect(() => {
    const fetchParts = async () => {
      try {
        setLoadingParts(true);
        const { data, error } = await supabase
          .from('parts_inventory')
          .select('*')
          .gt('quantity', 0); // Uniquement les pièces en stock
          
        if (error) throw error;
        
        // Convertir les données brutes en objets Part
        const convertedParts: Part[] = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          partNumber: item.part_number || '',
          category: item.category || '',
          compatibility: item.compatible_with || [],
          manufacturer: item.supplier || '',
          price: item.unit_price || 0,
          stock: item.quantity,
          location: item.location || '',
          reorderPoint: item.reorder_threshold || 5,
          image: item.image_url || 'https://placehold.co/400x300/png?text=No+Image'
        }));
        
        setParts(convertedParts);
      } catch (error) {
        console.error("Erreur lors du chargement des pièces:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger la liste des pièces",
          variant: "destructive",
        });
      } finally {
        setLoadingParts(false);
      }
    };

    const fetchEquipment = async () => {
      try {
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name');
          
        if (error) throw error;
        
        setEquipment(
          (data || []).map(item => ({
            value: item.id.toString(),
            label: item.name,
          }))
        );
      } catch (error) {
        console.error("Erreur lors du chargement des équipements:", error);
      }
    };

    const fetchTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('maintenance_tasks')
          .select('id, title')
          .eq('status', 'in_progress');
          
        if (error) throw error;
        
        setTasks(
          (data || []).map(item => ({
            value: item.id.toString(),
            label: item.title,
          }))
        );
      } catch (error) {
        console.error("Erreur lors du chargement des tâches:", error);
      }
    };

    if (isOpen) {
      fetchParts();
      fetchEquipment();
      fetchTasks();
    }
  }, [isOpen, toast]);

  const handlePartSelect = (partIdStr: string) => {
    const partId = parseInt(partIdStr);
    form.setValue("part_id", partId);
    
    // Mettre à jour la pièce sélectionnée
    const part = parts.find(p => p.id === partId);
    if (part) {
      setSelectedPart(part);
      
      // Réinitialiser la quantité à 1 si la nouvelle pièce a été sélectionnée
      form.setValue("quantity", 1);
    }
  };

  const onSubmit = async (values: WithdrawalFormValues) => {
    setIsSubmitting(true);
    try {
      const success = await withdrawPart({
        part_id: values.part_id,
        quantity: values.quantity,
        equipment_id: values.equipment_id,
        task_id: values.task_id,
        notes: values.notes
      });
      
      if (success) {
        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      toast({
        title: "Échec",
        description: "Une erreur est survenue lors du retrait",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Retrait de pièce
          </DialogTitle>
          <DialogDescription>
            Retirez une pièce de l'inventaire après son utilisation
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="part_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pièce <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Combobox
                      options={parts.map(part => ({
                        value: part.id.toString(),
                        label: `${part.name} (${part.stock} en stock)`,
                      }))}
                      placeholder="Rechercher une pièce..."
                      emptyMessage="Aucune pièce trouvée"
                      onSelect={handlePartSelect}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantité <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={selectedPart?.stock || 1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      disabled={!selectedPart}
                    />
                  </FormControl>
                  {selectedPart && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Quantité maximum: {selectedPart.stock}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="equipment_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Équipement associé</FormLabel>
                  <FormControl>
                    <Combobox
                      options={equipment}
                      placeholder="Sélectionner un équipement..."
                      emptyMessage="Aucun équipement trouvé"
                      onSelect={(value) => field.onChange(Number(value))}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="task_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tâche associée</FormLabel>
                  <FormControl>
                    <Combobox
                      options={tasks}
                      placeholder="Sélectionner une tâche..."
                      emptyMessage="Aucune tâche en cours trouvée"
                      onSelect={(value) => field.onChange(Number(value))}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes d'utilisation</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Informations complémentaires sur l'utilisation de cette pièce..."
                      className="resize-none"
                      {...field}
                    />
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
                disabled={isSubmitting || !selectedPart}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Wrench className="mr-2 h-4 w-4" />
                    Confirmer le retrait
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default WithdrawPartDialog;
