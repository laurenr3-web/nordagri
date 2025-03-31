
import React from 'react';
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Tool, FileCheck, CheckCircle } from 'lucide-react';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Intervention } from '@/types/Intervention';
import { ScrollArea } from '@/components/ui/scroll-area';

// Schéma de validation pour le formulaire
const formSchema = z.object({
  duration: z.coerce
    .number()
    .min(0.1, {
      message: "La durée doit être supérieure à 0",
    }),
  notes: z.string().min(1, {
    message: "Veuillez fournir un compte-rendu de l'intervention",
  }),
  partsUsed: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      quantity: z.number().min(1),
    })
  ).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface InterventionReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intervention: Intervention | null;
  onSubmit: (intervention: Intervention, report: FormValues) => void;
  availableParts?: Array<{ id: number; name: string; quantity: number; }>;
}

const InterventionReportDialog: React.FC<InterventionReportDialogProps> = ({
  open,
  onOpenChange,
  intervention,
  onSubmit,
  availableParts = []
}) => {
  // Valeurs par défaut
  const defaultValues: Partial<FormValues> = {
    duration: intervention?.scheduledDuration || 1,
    notes: `Intervention ${intervention?.title} réalisée sur l'équipement ${intervention?.equipment}.`,
    partsUsed: intervention?.partsUsed || [],
  };

  // Form hooks
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Soumettre le formulaire
  const handleSubmit = (values: FormValues) => {
    if (intervention) {
      onSubmit(intervention, values);
      onOpenChange(false);
    }
  };

  if (!intervention) return null;

  // Ajouter une pièce utilisée
  const addPart = (part: { id: number; name: string; }) => {
    const currentParts = form.getValues('partsUsed') || [];
    const existingPartIndex = currentParts.findIndex(p => p.id === part.id);
    
    if (existingPartIndex >= 0) {
      // Incrémenter la quantité si la pièce existe déjà
      const updatedParts = [...currentParts];
      updatedParts[existingPartIndex].quantity += 1;
      form.setValue('partsUsed', updatedParts);
    } else {
      // Ajouter une nouvelle pièce avec quantité 1
      form.setValue('partsUsed', [...currentParts, { ...part, quantity: 1 }]);
    }
  };

  // Retirer une pièce
  const removePart = (partId: number) => {
    const currentParts = form.getValues('partsUsed') || [];
    form.setValue(
      'partsUsed',
      currentParts.filter(p => p.id !== partId)
    );
  };

  // Mettre à jour la quantité d'une pièce
  const updatePartQuantity = (partId: number, quantity: number) => {
    const currentParts = form.getValues('partsUsed') || [];
    const updatedParts = currentParts.map(part => 
      part.id === partId ? { ...part, quantity } : part
    );
    form.setValue('partsUsed', updatedParts);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileCheck className="mr-2 h-5 w-5" />
            Rapport d'intervention
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="pr-4 max-h-[calc(90vh-180px)]">
          <div className="bg-muted/50 p-3 rounded-md mb-4">
            <h3 className="text-sm font-semibold mb-2">Détails de l'intervention</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Titre:</span> {intervention.title}
              </div>
              <div>
                <span className="text-muted-foreground">Équipement:</span> {intervention.equipment}
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span> {format(intervention.date, 'dd/MM/yyyy', { locale: fr })}
              </div>
              <div>
                <span className="text-muted-foreground">Technicien:</span> {intervention.technician || 'Non assigné'}
              </div>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Durée réelle */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée réelle (heures)</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Input 
                          type="number" 
                          min="0.1" 
                          step="0.1"
                          {...field} 
                        />
                        <Clock className="w-4 h-4 text-muted-foreground ml-2" />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Durée effective de l'intervention
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Pièces utilisées */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Pièces utilisées</h3>
                
                {availableParts.length > 0 && (
                  <div className="mb-2">
                    <h4 className="text-xs text-muted-foreground mb-1">Ajouter une pièce :</h4>
                    <div className="flex flex-wrap gap-1">
                      {availableParts.map(part => (
                        <Button
                          key={part.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => addPart(part)}
                        >
                          <Tool className="h-3 w-3 mr-1" />
                          {part.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {form.watch('partsUsed')?.map((part, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/30 p-2 rounded-md">
                      <div className="flex items-center">
                        <Tool className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{part.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="number"
                          min="1"
                          value={part.quantity}
                          onChange={(e) => updatePartQuantity(part.id, parseInt(e.target.value) || 1)}
                          className="w-16 h-8 text-sm"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => removePart(part.id)}
                        >
                          &times;
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {(!form.watch('partsUsed') || form.watch('partsUsed').length === 0) && (
                    <div className="text-sm text-muted-foreground text-center py-2">
                      Aucune pièce utilisée
                    </div>
                  )}
                </div>
              </div>
              
              {/* Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Compte-rendu</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez les travaux effectués et observations"
                        rows={6}
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
                >
                  Annuler
                </Button>
                <Button type="submit">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Valider l'intervention
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default InterventionReportDialog;
