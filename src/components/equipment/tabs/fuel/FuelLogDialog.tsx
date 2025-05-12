
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FuelLogFormValues } from '@/types/FuelLog';
import { CalendarIcon, InfoIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const fuelLogSchema = z.object({
  date: z.date(),
  fuel_quantity_liters: z.coerce.number().positive('Quantité requise'),
  price_per_liter: z.coerce.number().positive('Prix requis'),
  hours_at_fillup: z.coerce.number().optional().nullable(),
  km_at_fillup: z.coerce.number().optional().nullable(),
  notes: z.string().optional().nullable()
});

interface FuelLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FuelLogFormValues) => void;
  isSubmitting: boolean;
  equipmentId: number;
  currentHours?: number;
  currentKm?: number;
}

export function FuelLogDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  equipmentId,
  currentHours,
  currentKm
}: FuelLogDialogProps) {
  const form = useForm<FuelLogFormValues>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      date: new Date(),
      fuel_quantity_liters: 0,
      price_per_liter: 0,
      hours_at_fillup: currentHours || null,
      km_at_fillup: currentKm || null,
      notes: '',
    }
  });
  
  const handleSubmit = (values: FuelLogFormValues) => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un plein de carburant</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("date") && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("date") ? format(form.watch("date"), "dd/MM/yyyy") : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.watch("date")}
                    onSelect={(date) => date && form.setValue("date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.date && (
                <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fuel_quantity_liters">Quantité (L)</Label>
              <Input
                id="fuel_quantity_liters"
                type="number"
                step="0.01"
                {...form.register("fuel_quantity_liters")}
              />
              {form.formState.errors.fuel_quantity_liters && (
                <p className="text-sm text-red-500">{form.formState.errors.fuel_quantity_liters.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price_per_liter">Prix par litre</Label>
              <Input
                id="price_per_liter"
                type="number"
                step="0.01"
                {...form.register("price_per_liter")}
              />
              {form.formState.errors.price_per_liter && (
                <p className="text-sm text-red-500">{form.formState.errors.price_per_liter.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hours_at_fillup">Compteur horaire</Label>
              <Input
                id="hours_at_fillup"
                type="number"
                step="0.1"
                placeholder={currentHours ? `Actuel: ${currentHours}` : "Optionnel"}
                {...form.register("hours_at_fillup")}
              />
              {form.formState.errors.hours_at_fillup && (
                <p className="text-sm text-red-500">{form.formState.errors.hours_at_fillup.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="km_at_fillup">Kilométrage</Label>
              <Input
                id="km_at_fillup"
                type="number"
                placeholder={currentKm ? `Actuel: ${currentKm}` : "Optionnel"}
                {...form.register("km_at_fillup")}
              />
              {form.formState.errors.km_at_fillup && (
                <p className="text-sm text-red-500">{form.formState.errors.km_at_fillup.message}</p>
              )}
            </div>
          </div>
          
          <Alert className="bg-blue-50 text-blue-800 border-blue-200">
            <InfoIcon className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm">
              Si les heures moteur ou le kilométrage saisis sont supérieurs aux valeurs actuelles de l'équipement, celles-ci seront automatiquement mises à jour.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Informations complémentaires"
              {...form.register("notes")}
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
