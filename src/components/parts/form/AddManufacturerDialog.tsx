
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useManufacturers } from '@/hooks/parts/useManufacturers';
import { Loader2 } from 'lucide-react';

interface AddManufacturerDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectManufacturer: (manufacturer: string) => void;
}

export default function AddManufacturerDialog({
  isOpen,
  onOpenChange,
  onSelectManufacturer
}: AddManufacturerDialogProps) {
  const [manufacturerName, setManufacturerName] = useState('');
  const { addManufacturer, isAdding } = useManufacturers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturerName.trim()) return;

    try {
      const result = await addManufacturer(manufacturerName.trim());
      if (result) {
        onSelectManufacturer(result.name);
        setManufacturerName('');
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to add manufacturer:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau fabricant</DialogTitle>
            <DialogDescription>
              Entrez le nom du fabricant à ajouter à votre liste.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={manufacturerName}
                onChange={(e) => setManufacturerName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isAdding}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!manufacturerName.trim() || isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Ajouter'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
