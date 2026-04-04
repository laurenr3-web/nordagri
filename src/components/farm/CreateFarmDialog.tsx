import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

interface CreateFarmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onFarmCreated: (farmId: string) => void;
}

export function CreateFarmDialog({ open, onOpenChange, userId, onFarmCreated }: CreateFarmDialogProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Le nom de la ferme est requis');
      return;
    }

    setLoading(true);
    try {
      // 1. Create the farm
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .insert({
          name: name.trim(),
          location: location.trim() || null,
          description: description.trim() || null,
          owner_id: userId,
        })
        .select('id')
        .single();

      if (farmError) throw farmError;

      // 2. Link the profile to the farm
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ farm_id: farm.id })
        .eq('id', userId);

      if (profileError) throw profileError;

      // 3. Create default farm settings
      await supabase.from('farm_settings').insert({ farm_id: farm.id });

      // 4. Add user as farm member (owner)
      await supabase.from('farm_members').insert({
        farm_id: farm.id,
        user_id: userId,
        role: 'owner',
      });

      toast.success('Ferme créée avec succès !');
      onFarmCreated(farm.id);
      onOpenChange(false);
      setName('');
      setLocation('');
      setDescription('');
    } catch (error: any) {
      console.error('Erreur lors de la création de la ferme:', error);
      toast.error(error.message || 'Erreur lors de la création de la ferme');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer votre ferme</DialogTitle>
          <DialogDescription>
            Créez votre exploitation pour commencer à gérer vos équipements, maintenances et plus encore.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="farm-name">Nom de la ferme *</Label>
            <Input
              id="farm-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Ferme du Soleil"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farm-location">Localisation</Label>
            <Input
              id="farm-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Saint-Hyacinthe, QC"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="farm-description">Description</Label>
            <Textarea
              id="farm-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement votre exploitation..."
              disabled={loading}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={loading || !name.trim()}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Créer la ferme
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}