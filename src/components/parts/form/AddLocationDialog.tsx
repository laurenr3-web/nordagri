
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
import { Textarea } from '@/components/ui/textarea';
import { useStorageLocations } from '@/hooks/parts/useStorageLocations';
import { Loader2 } from 'lucide-react';

interface AddLocationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectLocation: (location: string) => void;
}

export default function AddLocationDialog({
  isOpen,
  onOpenChange,
  onSelectLocation
}: AddLocationDialogProps) {
  const [locationName, setLocationName] = useState('');
  const [locationDescription, setLocationDescription] = useState('');
  const { addLocation, isAdding } = useStorageLocations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim()) return;

    try {
      const result = await addLocation(locationName.trim(), locationDescription.trim() || undefined);
      if (result && result.name) {
        onSelectLocation(result.name);
        setLocationName('');
        setLocationDescription('');
        onOpenChange(false);
      } else {
        console.error('Location added but no name property returned');
      }
    } catch (error) {
      console.error('Failed to add location:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel emplacement</DialogTitle>
            <DialogDescription>
              Entrez les informations de l'emplacement à ajouter à votre liste.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-name" className="text-right">
                Nom
              </Label>
              <Input
                id="location-name"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="location-description"
                value={locationDescription}
                onChange={(e) => setLocationDescription(e.target.value)}
                className="col-span-3"
                rows={3}
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
            <Button type="submit" disabled={!locationName.trim() || isAdding}>
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
