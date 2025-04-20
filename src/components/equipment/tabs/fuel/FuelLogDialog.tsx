
import * as React from 'react';
import { DialogWrapper } from '@/components/ui/dialog-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FuelLogFormValues } from '@/types/FuelLog';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface FuelLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: FuelLogFormValues) => void;
  isSubmitting?: boolean;
}

export function FuelLogDialog({ open, onOpenChange, onSubmit, isSubmitting }: FuelLogDialogProps) {
  const [date, setDate] = React.useState<Date>(new Date());
  const [quantity, setQuantity] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [hours, setHours] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'P') : <span>Choisir une date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Quantité (litres)</Label>
          <Input
            type="number"
            step="0.01"
            required
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Prix par litre (€)</Label>
          <Input
            type="number"
            step="0.001"
            required
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Heures au compteur</Label>
          <Input
            type="number"
            step="0.1"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </DialogWrapper>
  );
}
