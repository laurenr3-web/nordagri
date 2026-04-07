
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface UpdateHoursDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  equipmentId: number | string;
  currentValue: number | null | undefined;
  unit: string;
  onUpdated: (newValue: number) => void;
}

const UpdateHoursDialog: React.FC<UpdateHoursDialogProps> = ({
  open,
  onOpenChange,
  equipmentId,
  currentValue,
  unit,
  onUpdated,
}) => {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const unitShort = unit === 'heures' ? 'h' : 'km';
  const unitLabel = unit === 'heures' ? 'Heures moteur' : 'Kilomètres';

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setValue(String(currentValue || 0));
    }
    onOpenChange(isOpen);
  };

  const handleSave = async () => {
    const newValue = parseFloat(value);
    if (isNaN(newValue) || newValue < 0) {
      toast.error('Veuillez entrer une valeur valide');
      return;
    }

    setSaving(true);
    try {
      const id = typeof equipmentId === 'string' ? parseInt(equipmentId, 10) : equipmentId;

      const { error } = await supabase
        .from('equipment')
        .update({
          valeur_actuelle: newValue,
          last_wear_update: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      onUpdated(newValue);
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      onOpenChange(false);
      toast.success(`Compteur mis à jour : ${newValue} ${unitShort}`);
    } catch (error: any) {
      console.error('Error updating counter:', error);
      toast.error('Impossible de mettre à jour le compteur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={handleOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Mettre à jour le compteur</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-2 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
            <span className="text-sm text-muted-foreground">Valeur actuelle</span>
            <span className="text-lg font-semibold">
              {currentValue ?? 0} {unitShort}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-value" className="text-base">
              Nouvelle lecture ({unitLabel})
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="new-value"
                type="number"
                inputMode="decimal"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="text-lg h-12"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSave();
                }}
              />
              <span className="text-muted-foreground font-medium shrink-0">{unitShort}</span>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full h-12 text-base"
          >
            {saving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Check className="mr-2 h-5 w-5" />
            )}
            Enregistrer
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" size="lg" className="w-full">
              Annuler
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default UpdateHoursDialog;
