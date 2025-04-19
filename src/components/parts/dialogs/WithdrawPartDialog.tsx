
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { withdrawPart, checkWithdrawalAvailability } from '@/services/supabase/parts/withdrawPart';
import { Part } from '@/types/Part';

// Define schema for form validation
const withdrawalFormSchema = z.object({
  quantity: z.preprocess(
    (val) => parseInt(String(val), 10),
    z.number()
      .positive('La quantité doit être supérieure à zéro')
      .int('La quantité doit être un nombre entier')
  ),
  equipment_id: z.string().optional().nullable().transform(val => 
    val === '' || val === undefined ? null : parseInt(val, 10)
  ),
  task_id: z.string().optional().nullable().transform(val => 
    val === '' || val === undefined ? null : parseInt(val, 10)
  ),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof withdrawalFormSchema>;

interface WithdrawPartDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  part: Part | null;
  equipments?: Array<{ id: number, name: string }>;
  tasks?: Array<{ id: number, title: string }>;
  onWithdrawalComplete?: () => void;
}

export function WithdrawPartDialog({
  isOpen,
  onOpenChange,
  part,
  equipments = [],
  tasks = [],
  onWithdrawalComplete
}: WithdrawPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      quantity: 1,
      equipment_id: null,
      task_id: null,
      notes: '',
    },
  });

  // Reset form when dialog opens with a new part
  useEffect(() => {
    if (isOpen && part) {
      form.reset({
        quantity: 1,
        equipment_id: null,
        task_id: null,
        notes: '',
      });
      setSuccess(false);
    }
  }, [isOpen, part, form]);

  // Handle form submission
  async function onSubmit(data: FormValues) {
    if (!part) return;
    
    setIsSubmitting(true);
    
    try {
      // Check if withdrawal is possible
      const isAvailable = await checkWithdrawalAvailability(part.id, data.quantity);
      
      if (!isAvailable) {
        toast({
          variant: "destructive",
          title: "Stock insuffisant",
          description: `Il n'y a pas assez de stock disponible. Stock actuel: ${part.stock || 0}`,
        });
        setIsSubmitting(false);
        return;
      }
      
      // Submit withdrawal
      const result = await withdrawPart({
        part_id: part.id,
        quantity: data.quantity,
        equipment_id: data.equipment_id,
        task_id: data.task_id,
        notes: data.notes,
      });
      
      if (result.success) {
        toast({
          title: "Succès",
          description: `${data.quantity} unités de ${part.name} ont été retirées avec succès`,
        });
        setSuccess(true);
        
        if (onWithdrawalComplete) {
          onWithdrawalComplete();
        }
        
        // Close dialog after a short delay
        setTimeout(() => {
          onOpenChange(false);
        }, 1500);
      } else {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors du retrait de la pièce",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors du retrait de la pièce",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Retrait de pièce</DialogTitle>
          <DialogDescription>
            Retirez {part.name} de l'inventaire
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="rounded-full bg-green-100 p-3 mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-green-600"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h3 className="text-lg font-medium">Retrait effectué avec succès</h3>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Pièce</p>
                  <p className="text-sm">{part.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Stock disponible</p>
                  <p className="text-sm">{part.stock || 0}</p>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité*</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={part.stock || 0}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {equipments.length > 0 && (
                <FormField
                  control={form.control}
                  name="equipment_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Équipement</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un équipement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Aucun</SelectItem>
                          {equipments.map((equipment) => (
                            <SelectItem key={equipment.id} value={equipment.id.toString()}>
                              {equipment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {tasks.length > 0 && (
                <FormField
                  control={form.control}
                  name="task_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tâche / Intervention</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value?.toString() || ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une tâche" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Aucune</SelectItem>
                          {tasks.map((task) => (
                            <SelectItem key={task.id} value={task.id.toString()}>
                              {task.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ajouter des notes concernant ce retrait..."
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
                  disabled={isSubmitting || (part.stock || 0) <= 0}
                >
                  {isSubmitting ? 'Traitement...' : 'Confirmer le retrait'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
