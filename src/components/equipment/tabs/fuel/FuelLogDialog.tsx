
import * as React from 'react';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FuelLogFormValues } from '@/types/FuelLog';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { FormValidation } from '@/components/common/FormValidation';
import { useFarmId } from '@/hooks/useFarmId';
import { useCallback, useMemo, useState } from 'react';

interface FuelLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FuelLogFormValues) => void;
  isSubmitting?: boolean;
  equipmentId: number;
}

export function FuelLogDialog({ open, onOpenChange, onSubmit, isSubmitting, equipmentId }: FuelLogDialogProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [hours, setHours] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    quantity?: string;
    price?: string;
  }>({});
  
  const { farmId } = useFarmId(equipmentId);
  
  // Memoize the validation failed handler
  const handleValidationFailed = useCallback(() => {
    if (open) {
      onOpenChange(false);
    }
  }, [open, onOpenChange]);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setDate(new Date());
      setQuantity('');
      setPrice('');
      setHours('');
      setNotes('');
      setErrors({});
    }
  }, [open]);

  // Memoize the form validation function to prevent it from running on every render
  const validateForm = useCallback((): boolean => {
    const newErrors: {
      quantity?: string;
      price?: string;
    } = {};
    
    if (!quantity || parseFloat(quantity) <= 0) {
      newErrors.quantity = 'La quantité est obligatoire et doit être supérieure à 0';
    }
    
    if (!price || parseFloat(price) <= 0) {
      newErrors.price = 'Le prix est obligatoire et doit être supérieur à 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [quantity, price]);
  
  // Memoize the isValid result
  const isFormValid = useMemo(() => {
    return validateForm();
  }, [validateForm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !farmId) return;
    
    onSubmit({
      date,
      fuel_quantity_liters: Number(quantity),
      price_per_liter: Number(price),
      hours_at_fillup: hours ? Number(hours) : undefined,
      notes: notes || undefined,
    });
  };

  return (
    <DialogWrapper
      title="Ajouter un plein de carburant"
      description="Enregistrez un nouveau plein de carburant pour cet équipement"
      open={open}
      onOpenChange={onOpenChange}
    >
      <FormValidation
        isValid={isFormValid}
        farmId={farmId}
        isSubmitting={isSubmitting}
        onValidationFailed={handleValidationFailed}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fuel-date">Date <span className="text-red-500">*</span></Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="fuel-date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'P', { locale: fr }) : <span>Choisir une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(date) => date && setDate(date)}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-quantity">
              Quantité (litres) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fuel-quantity"
              type="number"
              step="0.01"
              required
              min="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={errors.quantity ? "border-red-500" : ""}
            />
            {errors.quantity && (
              <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-price">
              Prix par litre (€) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="fuel-price"
              type="number"
              step="0.001"
              required
              min="0.001"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-hours">Heures au compteur</Label>
            <Input
              id="fuel-hours"
              type="number"
              step="0.1"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-notes">Notes</Label>
            <Textarea 
              id="fuel-notes"
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations supplémentaires..."
              className="resize-none min-h-[100px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </FormValidation>
    </DialogWrapper>
  );
}
